import { Snapshot } from '../types';
import { fsAdapter } from '../utils/fs-adapter';
import * as path from 'path';

export class SnapshotManager {
  private snapshotPath: string;
  private writesSinceLast: number = 0;

  constructor(dbPath: string = './chronodata') {
    this.snapshotPath = path.join(dbPath, 'snapshots.log');
  }

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
    fsAdapter.appendFileSync(this.snapshotPath, entry);
    this.writesSinceLast = 0;

    return snapshot;
  }

  list(): Snapshot[] {
    const raw = fsAdapter.readFileSync(this.snapshotPath);
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
    fsAdapter.writeFileSync(this.snapshotPath, '');
  }

  saveAll(snaps: Snapshot[]) {
    const newContent = snaps.map(s => JSON.stringify(s)).join('\n') + (snaps.length > 0 ? '\n' : '');
    fsAdapter.writeFileSync(this.snapshotPath, newContent);
  }

  getMetaRaw() {
    return fsAdapter.readFileSync(this.snapshotPath);
  }
}
