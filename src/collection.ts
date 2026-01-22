import path from "path";
import { v4 as uuid } from "uuid";
import { ensureDir, readJSON, writeJSON } from "./utils/file";
import { EnumSchema, FieldSchema, Query, Schema, WithId } from "./types";
import { formatTimestamp } from "./utils/formatTimestamp";

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* Collection                         */
export class Collection<T extends Record<string, any>> {
    private indexFile: string;

    constructor(
        private file: string,
        private onChange: () => void,
        private schema?: Schema<T>,
        private indexedFields: (keyof T)[] = [],
        private strict: boolean = true
    ) {
        /* ---------- Guard: invalid collection path ---------- */
        if (!file || typeof file !== "string") {
            throw new Error("Invalid collection file path");
        }

        /* ---------- Guard: invalid schema ---------- */
        if (schema !== undefined) {
            if (!isPlainObject(schema)) {
                throw new Error("Invalid schema definition: schema must be an object");
            }

            for (const [key, rule] of Object.entries(schema)) {
                if (
                    typeof rule !== "string" &&
                    !isPlainObject(rule)
                ) {
                    throw new Error(
                        `Invalid schema rule for field "${key}"`
                    );
                }

                if (isPlainObject(rule)) {
                    if (
                        "type" in rule &&
                        typeof (rule as any).type !== "string"
                    ) {
                        throw new Error(
                            `Invalid schema type for field "${key}"`
                        );
                    }
                }
            }
        }

        /* ---------- Guard: invalid indexed fields ---------- */
        if (!Array.isArray(indexedFields)) {
            throw new Error("indexes must be an array of field names");
        }

        this.indexFile = `${file}.index.json`;
        ensureDir(path.dirname(file));
        this.rebuildIndexes();
    }

    /* Storage                            */
    private load(): WithId<T & { createdAt: string; updatedAt: string }>[] {
        return readJSON(this.file, []);
    }

    private save(data: WithId<T & { createdAt: string; updatedAt: string }>[]): void {
        writeJSON(this.file, data);
        this.rebuildIndexes();
        this.onChange();
    }

    /* Schema Validation                  */
    private validateSchema(
        doc: T,
        opts?: { skipDistinctCheck?: boolean; existingDocs?: Array<Record<string, any>>; excludeId?: string }
    ): T {
        if (!this.schema) {
            throw new Error(
                "Schema validation failed: collection has no schema"
            );
        }

        if (!isPlainObject(doc)) {
            throw new Error("Invalid document: document must be an object");
        }

        const skipDistinctCheck = opts?.skipDistinctCheck ?? false;
        const existingDocs = opts?.existingDocs ?? this.load();
        const excludeId = opts?.excludeId;

        const result: Record<string, any> = { ...doc };

        /* ---------- Unknown fields ---------- */
        if (this.strict) {
            for (const key of Object.keys(result)) {
                if (!(key in this.schema)) {
                    throw new Error(`Unknown field "${key}" not defined in schema`);
                }
            }
        }

        /* ---------- Field rules ---------- */
        for (const key in this.schema) {
            const rule = this.schema[key];
            const value = result[key];

            /* Primitive shorthand */
            if (typeof rule === "string") {
                if (value === undefined) {
                    throw new Error(`Schema violation: ${key} is required`);
                }
                if (typeof value !== rule) {
                    throw new Error(`Schema violation: ${key} should be ${rule}`);
                }
                continue;
            }

            /* Enum */
            if ((rule as EnumSchema).type === "enum") {
                const enumRule = rule as EnumSchema;
                if (value === undefined) {
                    throw new Error(`Schema violation: ${key} is required`);
                }
                if (!enumRule.values.includes(value)) {
                    throw new Error(
                        `Schema violation: ${key} must be one of ${enumRule.values.join(", ")}`
                    );
                }
                continue;
            }

            /* FieldSchema */
            const fieldRule = rule as FieldSchema & { important?: boolean; distinct?: boolean };

            if (value === undefined) {
                if (fieldRule.default !== undefined) {
                    result[key] = fieldRule.default;
                    continue;
                }
                if (fieldRule.important) {
                    throw new Error(`Schema violation: ${key} is required`);
                }
                continue;
            }

            if (value === null && !fieldRule.nullable) {
                throw new Error(`Schema violation: ${key} cannot be null`);
            }

            if (value !== null) {
                if (fieldRule.type === "array") {
                    if (!Array.isArray(value)) {
                        throw new Error(`Schema violation: ${key} should be an array`);
                    }
                } else if (typeof value !== fieldRule.type) {
                    throw new Error(`Schema violation: ${key} should be ${fieldRule.type}`);
                }
            }

            if (fieldRule.validate && !fieldRule.validate(value)) {
                throw new Error(`Schema violation: ${key} failed custom validation`);
            }

            if (fieldRule.distinct && !skipDistinctCheck) {
                const exists = existingDocs.some(
                    d => d[key] === value && d.id !== excludeId
                );
                if (exists) {
                    throw new Error(`Schema violation: ${key} must be distinct`);
                }
            }
        }

        return result as T;
    }

    /* Indexing                           */
    private rebuildIndexes(): void {
        if (this.indexedFields.length === 0) return;

        const data = this.load();
        const indexes: Record<string, Record<string, string[]>> = {};

        for (const field of this.indexedFields) {
            indexes[field as string] = {};
        }

        for (const doc of data) {
            for (const field of this.indexedFields) {
                const value = String(doc[field]);
                indexes[field as string][value] ??= [];
                indexes[field as string][value].push(doc.id);
            }
        }

        writeJSON(this.indexFile, indexes);
    }


    async add(doc: T) {
        const validated = this.validateSchema(doc);
        const timestamp = formatTimestamp(Date.now());
        const withId = { id: uuid(), createdAt: timestamp, updatedAt: timestamp, ...validated };
        const data = this.load();
        data.push(withId);
        this.save(data);
        return withId;
    }

    async addMany(docs: T[]) {
        if (!Array.isArray(docs)) {
            throw new Error("addMany expects an array of documents");
        }
        if (!docs.length) return [];

        const persisted = this.load();
        const validatedDocs: T[] = [];

        for (const doc of docs) {
            const validated = this.validateSchema(doc, {
                existingDocs: validatedDocs.concat(persisted)
            });
            validatedDocs.push(validated);
        }

        const timestamp = formatTimestamp(Date.now());
        const withIds = validatedDocs.map(d => ({
            id: uuid(),
            createdAt: timestamp,
            updatedAt: timestamp,
            ...d
        }));

        const data = this.load();
        data.push(...withIds);
        this.save(data);
        return withIds;
    }

    async getAll() {
        return this.load();
    }

    async getOne(query: Query<WithId<T>>) {
        return this.load().find(d =>
            Object.entries(query).every(([k, v]) => d[k as keyof WithId<T>] === v)
        );
    }

    async getMany(query: Query<WithId<T>>) {
        if (!query || !Object.keys(query).length) {
            throw new Error("getMany requires a query object");
        }

        return this.load().filter(d =>
            Object.entries(query).every(([k, v]) => d[k as keyof WithId<T>] === v)
        );
    }

    async updateById(id: string, update: Partial<T>) {
        const data = this.load();
        const item = data.find(d => d.id === id);
        if (!item) throw new Error("Document not found");

        const updatedRaw = { ...item, ...update };
        delete (updatedRaw as any).id;

        const validated = this.validateSchema(updatedRaw as T, {
            skipDistinctCheck: true,
            excludeId: id
        });

        Object.assign(item, validated);
        item.updatedAt = formatTimestamp(Date.now());
        this.save(data);
    }

    async deleteById(id: string) {
        const data = this.load().filter(d => d.id !== id);
        this.save(data);
    }

    async deleteMany(query: Query<WithId<T>>) {
        if (!query || !Object.keys(query).length) {
            throw new Error("deleteMany requires a query object");
        }

        const data = this.load();
        const initialLength = data.length;

        const remaining = data.filter(d =>
            !Object.entries(query).every(([k, v]) =>
                d[k as keyof WithId<T>] === v
            )
        );

        const deletedCount = initialLength - remaining.length;

        if (deletedCount > 0) {
            this.save(remaining);
        }

        return deletedCount;
    }

    async deleteAll() {
        this.save([]);
    }
}