import { SnapshotMeta } from "./types";
import { HttpClient } from "./utils/http";
import { loadToken } from "./utils/token";

const API_BASE_URL = process.env.CHRONODB_CLOUD_API ?? "https://api.chronodb.app";

export class CloudSync {
    private token: string | null = null;
    private http: HttpClient | null = null;
    private initialized = false;

    constructor() {
        // nothing yet
    }

    private async init(): Promise<void> {
        if (this.initialized) return;

        this.token = await loadToken();

        if (this.token) {
            this.http = new HttpClient(API_BASE_URL, this.token);
        }

        this.initialized = true;
    }

    async enabled(): Promise<boolean> {
        await this.init();
        return this.http !== null;
    }

    async syncSnapshot(snapshot: SnapshotMeta): Promise<void> {
        await this.init();

        if (!this.http) return;

        try {
            await this.http.post("/snapshots", {
                id: snapshot.snapshotId,
                timestamp: snapshot.timestamp,
                version: snapshot.version,
                reason: snapshot.reason
            });
        } catch {
            // swallow all cloud errors silently
        }
    }
}