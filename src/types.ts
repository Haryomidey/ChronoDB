export type Query<T> = Partial<{ [K in keyof T]: T[K] }>;
export type WithId<T> = T & { id: string };

export interface SnapshotMeta {
    snapshotId: string;
    timestamp: number;
    version: number;
    reason: "change" | "interval" | "manual";
}

export interface ChronoDBOptions {
    path?: string;
}

export type PrimitiveType =
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "undefined"
    | "function";

export interface AdvancedQueryOptions<T> {
    query?: Query<WithId<T>>;
    sortBy?: keyof WithId<T>;
    order?: "asc" | "desc";
    limit?: number;
    offset?: number;
}

export interface EnumSchema {
    type: "enum";
    values: readonly string[];
}

export interface FieldSchema {
    type: "string" | "number" | "boolean" | "object" | "array";
    important?: boolean;
    distinct?: boolean;
    nullable?: boolean;
    default?: unknown;
    validate?: (value: unknown) => boolean;
}

export type Schema<T extends Record<string, any>> = Partial<{
    [K in keyof T]: FieldSchema | EnumSchema | "string" | "number" | "boolean" | "object" | "array";
}>;