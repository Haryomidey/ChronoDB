import path from "path";
import { v4 as uuid } from "uuid";
import { ensureDir, readJSON, writeJSON } from "./utils/file";
import { CloudSync } from "./sync";
import { SnapshotMeta, Schema } from "./types";
import { Collection } from "./collection";

export class ChronoEngine {
    private snapshotsDir: string;
    private version = 1;
    private interval?: NodeJS.Timeout;
    private cloud: CloudSync | null;

    constructor(private basePath: string, options?: { cloudSync?: boolean }) {
        ensureDir(basePath);
        this.snapshotsDir = path.join(basePath, ".snapshots");
        ensureDir(this.snapshotsDir);

        this.cloud = options?.cloudSync === false ? null : new CloudSync();
    }

    col<T extends Record<string, any>>(
        name: string,
        options?: {
            schema?: Schema<T>;
            indexes?: (keyof T)[];
        }
    ): Collection<T> {
        const file = path.join(this.basePath, `${name}.json`);

        return new Collection<T>(
            file,
            () => this.createSnapshot("change"),
            options?.schema,
            options?.indexes
        );
    }

    async transaction(fn: () => Promise<void>): Promise<void> {
        const snapshotFile = path.join(this.snapshotsDir, "tx-backup.json");
        const state = readJSON<Record<string, unknown>>(
            path.join(this.basePath, ".__state.json"),
            {}
        );

        writeJSON(snapshotFile, state);

        try {
            await fn();
            await this.createSnapshot("manual");
        } catch (error) {
            const backup = readJSON<Record<string, unknown>>(snapshotFile, {});
            writeJSON(path.join(this.basePath, ".__state.json"), backup);
            throw new Error("Transaction rolled back");
        }
    }

    snapshots = {
        list: async (): Promise<SnapshotMeta[]> =>
            readJSON(path.join(this.snapshotsDir, "meta.json"), []),

        delete: async (id: string): Promise<void> => {
            const meta = await this.snapshots.list();
            writeJSON(
                path.join(this.snapshotsDir, "meta.json"),
                meta.filter(s => s.snapshotId !== id)
            );
        },

        deleteAll: async (): Promise<void> => {
            writeJSON(path.join(this.snapshotsDir, "meta.json"), []);
        },

        setInterval: async (ms: number): Promise<void> => {
            if (this.interval) clearInterval(this.interval);
            this.interval = setInterval(() => this.createSnapshot("interval"), ms);
        }
    };

    private async createSnapshot(reason: SnapshotMeta["reason"]): Promise<void> {
        const meta = await this.snapshots.list();

        const snapshot: SnapshotMeta = {
            snapshotId: uuid(),
            timestamp: Date.now(),
            version: this.version++,
            reason
        };

        meta.push(snapshot);
        writeJSON(path.join(this.snapshotsDir, "meta.json"), meta);

        if (!this.cloud) return;

        const enabled = await this.cloud.enabled();
        if (!enabled) return;

        await this.cloud.syncSnapshot(snapshot);
    }
}