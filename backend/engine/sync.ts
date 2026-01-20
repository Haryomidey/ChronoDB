
import { DBRecord, Snapshot, CloudUser } from '../types';

/**
 * SyncEngine handles the "Cloud" part of ChronoDB.
 * It manages uploading snapshots and metadata to the simulated backend.
 */
export class SyncEngine {
  private remoteSnapshots: Map<string, Snapshot[]> = new Map();
  private isSyncing: boolean = false;

  async sync(localSnapshots: Snapshot[], user: CloudUser): Promise<Snapshot[]> {
    if (!user.isLoggedIn || this.isSyncing) return localSnapshots;

    this.isSyncing = true;
    console.debug(`[CloudSync] Initiating sync for user: ${user.email}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedSnapshots = localSnapshots.map(snap => {
      if (!snap.isSynced) {
        console.debug(`[CloudSync] Uploading snapshot: ${snap.snapshot_id}`);
        // In a real app, this would be a POST to /api/snapshots
        return { ...snap, isSynced: true };
      }
      return snap;
    });

    // Update "Remote" store simulation
    this.remoteSnapshots.set(user.id, updatedSnapshots);
    
    this.isSyncing = false;
    return updatedSnapshots;
  }

  async deleteRemoteSnapshot(snapshotId: string, user: CloudUser): Promise<void> {
    console.debug(`[CloudSync] Removing snapshot ${snapshotId} from cloud storage.`);
    const remote = this.remoteSnapshots.get(user.id) || [];
    this.remoteSnapshots.set(user.id, remote.filter(s => s.snapshot_id !== snapshotId));
  }

  async clearRemote(user: CloudUser): Promise<void> {
    this.remoteSnapshots.delete(user.id);
  }
}
