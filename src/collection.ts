import path from "path";
import { v4 as uuid } from "uuid";
import { ensureDir, readJSON, writeJSON } from "./utils/file";
import { AdvancedQueryOptions, EnumSchema, FieldSchema, Query, Schema, WithId } from "./types";

export class Collection<T extends Record<string, any>> {
    private indexFile: string;

    constructor(
        private file: string,
        private onChange: () => void,
        private schema?: Schema<T>,
        private indexedFields: (keyof T)[] = [],
        private strict: boolean = true // reject unknown fields
    ) {
        this.indexFile = `${file}.index.json`;
        ensureDir(path.dirname(file));
        this.rebuildIndexes();
    }

    private load(): WithId<T>[] {
        return readJSON<WithId<T>[]>(this.file, []);
    }

    private save(data: WithId<T>[]): void {
        writeJSON(this.file, data);
        this.rebuildIndexes();
        this.onChange();
    }

    /** Validate schema including important, distinct, enums, arrays, nullable, defaults, and custom validators */
    private validateSchema(doc: T, skipDistinctCheck = false): T {
        if (!this.schema) return doc;
        const result: Record<string, any> = { ...doc };
        const data = this.load();

        // Reject unknown fields if strict mode
        if (this.strict) {
            for (const key of Object.keys(result)) {
                if (!(key in this.schema)) {
                    throw new Error(`Unknown field "${key}" not defined in schema`);
                }
            }
        }

        for (const key in this.schema) {
            const rule = this.schema[key];
            const value = result[key];

            // Primitive string type
            if (typeof rule === "string") {
                if (value === undefined) throw new Error(`Schema violation: ${key} is important`);
                if (typeof value !== rule) throw new Error(`Schema violation: ${key} should be ${rule}`);
                continue;
            }

            // Enum type
            if ((rule as EnumSchema).type === "enum") {
                const enumRule = rule as EnumSchema;
                if (value === undefined) throw new Error(`Schema violation: ${key} is important`);
                if (!enumRule.values.includes(value)) {
                    throw new Error(`Schema violation: ${key} must be one of ${enumRule.values.join(", ")}`);
                }
                continue;
            }

            const fieldRule = rule as FieldSchema & { important?: boolean; distinct?: boolean };

            // Missing value
            if (value === undefined) {
                if (fieldRule.default !== undefined) {
                    result[key] = fieldRule.default;
                    continue;
                }
                if (!fieldRule.important) continue;
                throw new Error(`Schema violation: ${key} is important`);
            }

            // Null value
            if (value === null) {
                if (!fieldRule.nullable) throw new Error(`Schema violation: ${key} cannot be null`);
                continue;
            }

            // Type check
            if (fieldRule.type === "array") {
                if (!Array.isArray(value)) throw new Error(`Schema violation: ${key} should be an array`);
            } else if (typeof value !== fieldRule.type) {
                throw new Error(`Schema violation: ${key} should be ${fieldRule.type}`);
            }

            // Custom validator
            if (fieldRule.validate && !fieldRule.validate(value)) {
                throw new Error(`Schema violation: ${key} failed custom validation`);
            }

            // Unique check
            if (!skipDistinctCheck && fieldRule.distinct) {
                const exists = data.some(d => d[key] === value);
                if (exists) throw new Error(`Schema violation: ${key} must be distinct (unique)`);
            }
        }

        return result as T;
    }

    /** Rebuild indexes for indexed fields */
    private rebuildIndexes(): void {
        if (this.indexedFields.length === 0) return;

        const data = this.load();
        const indexes: Record<string, Record<string, string[]>> = {};

        for (const field of this.indexedFields) indexes[field as string] = {};

        for (const doc of data) {
            for (const field of this.indexedFields) {
                const value = String(doc[field]);
                if (!indexes[field as string][value]) indexes[field as string][value] = [];
                indexes[field as string][value].push(doc.id);
            }
        }

        writeJSON(this.indexFile, indexes);
    }

    /** Query using index if possible */
    private queryUsingIndex(query: Query<WithId<T>>): WithId<T>[] | null {
        if (!this.indexedFields.length) return null;

        const indexData = readJSON<Record<string, Record<string, string[]>>>(this.indexFile, {});

        for (const key of Object.keys(query)) {
            if (this.indexedFields.includes(key as keyof T)) {
                const value = String(query[key as keyof WithId<T>]);
                const ids = indexData[key]?.[value];
                if (!ids) return [];
                const data = this.load();
                return data.filter(d => ids.includes(d.id));
            }
        }

        return null;
    }

    // ---------------- CRUD METHODS ---------------- //

    async add(doc: T): Promise<WithId<T>> {
        const validated = this.validateSchema(doc);
        const data = this.load();
        const withId = { id: uuid(), ...validated } as WithId<T>;
        data.push(withId);
        this.save(data);
        return withId;
    }

    async addMany(docs: T[]): Promise<WithId<T>[]> {
        const data = this.load();
        const withIds = docs.map(d => {
            const validated = this.validateSchema(d);
            return { id: uuid(), ...validated } as WithId<T>;
        });
        data.push(...withIds);
        this.save(data);
        return withIds;
    }

    async getOne(query: Query<WithId<T>>): Promise<WithId<T> | undefined> {
        const indexed = this.queryUsingIndex(query);
        const data = indexed ?? this.load();
        return data.find(d => Object.entries(query).every(([k, v]) => d[k as keyof WithId<T>] === v));
    }

    async getMany(query: Query<WithId<T>>): Promise<WithId<T>[]> {
        if (!query || Object.keys(query).length === 0) {
            throw new Error("getMany requires a query object");
        }
        const indexed = this.queryUsingIndex(query);
        const data = indexed ?? this.load();
        return data.filter(d => Object.entries(query).every(([k, v]) => d[k as keyof WithId<T>] === v));
    }

    async getAll(): Promise<WithId<T>[]> {
        return this.load();
    }

    async getManyAdvanced(options: AdvancedQueryOptions<T>): Promise<WithId<T>[]> {
        if (!options.query || Object.keys(options.query).length === 0) {
            throw new Error("getManyAdvanced requires a query object");
        }

        let data = await this.getMany(options.query);

        if (options.sortBy) {
            const key = options.sortBy;
            data.sort((a, b) =>
                a[key] > b[key] ? (options.order === "desc" ? -1 : 1) : (options.order === "desc" ? 1 : -1)
            );
        }

        if (options.offset) data = data.slice(options.offset);
        if (options.limit) data = data.slice(0, options.limit);

        return data;
    }

    async updateById(id: string, update: Partial<T>): Promise<void> {
        const data = this.load();
        const item = data.find(d => d.id === id);
        if (!item) return;

        const updated = { ...item, ...update };
        const validated = this.validateSchema(
            Object.fromEntries(Object.entries(updated).filter(([k]) => k !== "id")) as T,
            true
        );

        Object.assign(item, validated);
        this.save(data);
    }

    async updateMany(query: Query<WithId<T>>, update: Partial<T>): Promise<void> {
        if (!query || Object.keys(query).length === 0) {
            throw new Error("updateMany requires a query object");
        }

        const data = this.load();
        let changed = false;

        for (const item of data) {
            if (Object.entries(query).every(([k, v]) => item[k as keyof WithId<T>] === v)) {
                const updated = { ...item, ...update };
                const validated = this.validateSchema(
                    Object.fromEntries(Object.entries(updated).filter(([k]) => k !== "id")) as T,
                    true
                );

                Object.assign(item, validated);
                changed = true;
            }
        }

        if (changed) this.save(data);
    }

    async deleteById(id: string): Promise<void> {
        const data = this.load().filter(d => d.id !== id);
        this.save(data);
    }

    async deleteMany(query: Query<WithId<T>>): Promise<void> {
        if (!query || Object.keys(query).length === 0) {
            throw new Error("deleteMany requires a query object");
        }
        const data = this.load().filter(
            d => !Object.entries(query).every(([k, v]) => d[k as keyof WithId<T>] === v)
        );
        this.save(data);
    }

    async deleteAll(): Promise<void> {
        this.save([]);
    }
}