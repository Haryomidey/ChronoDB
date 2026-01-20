
import { Snapshot } from '../types';
import { vfs } from '../vfs';

export class SnapshotManager {
  private snapshotPath: string = 'snapshots.log';
  private writesSinceLast: number = 0;

  incrementWrite() {
    this.writesSinceLast++;
  }

  createSnapshot(version: number, reason: Snapshot['reason']): Snapshot | null {
    if (this.writesSinceLast === 0 && reason === 'interval') {
      return null; 
    }

    const snapshot: Snapshot = {
      snapshot_id: `snap_${Date.now()}_v${version}`,
      version,
      timestamp: Date.now(),
      reason,
      writesSinceLast: this.writesSinceLast,
      isSynced: false
    };

    const entry = JSON.stringify(snapshot) + '\n';
    vfs.appendFileSync(this.snapshotPath, entry);
    this.writesSinceLast = 0;

    return snapshot;
  }

  list(): Snapshot[] {
    const raw = vfs.readFileSync(this.snapshotPath);
    if (!raw) return [];
    return raw.trim().split('\n').filter(l => l).map(l => JSON.parse(l));
  }

  delete(snapshotId: string): boolean {
    const snaps = this.list();
    const filtered = snaps.filter(s => s.snapshot_id !== snapshotId);
    if (filtered.length === snaps.length) return false;
    
    this.saveAll(filtered);
    return true;
  }

  deleteAll(): void {
    vfs.writeFileSync(this.snapshotPath, '');
  }

  saveAll(snaps: Snapshot[]) {
    const newContent = snaps.map(s => JSON.stringify(s)).join('\n') + (snaps.length > 0 ? '\n' : '');
    vfs.writeFileSync(this.snapshotPath, newContent);
  }

  getMetaRaw() {
    return vfs.readFileSync(this.snapshotPath);
  }
}
