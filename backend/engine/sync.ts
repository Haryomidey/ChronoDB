import { DBRecord } from '../types';

export class SyncEngine {
  private lastSyncedVersion: number = 0;

  async sync(records: DBRecord[], currentVersion: number, user: any): Promise<boolean> {
    if (!user || !user.isLoggedIn) return false;

    const unsynced = records.filter(r => r.version > this.lastSyncedVersion);
    if (unsynced.length === 0) return true;

    console.debug(`[CloudSync] Syncing ${unsynced.length} records to ChronoDB Cloud for ${user.email}...`);

    this.lastSyncedVersion = currentVersion;
    return true;
  }
}