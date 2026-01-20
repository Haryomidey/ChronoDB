
import { LogEngine } from './engine/log';
import { IndexManager } from './engine/index';
import { VersionManager } from './engine/version';
import { SnapshotManager } from './engine/snapshot';
import { RestoreEngine } from './engine/restore';
import { Collection } from './engine/collection';
import { SyncEngine } from './engine/sync';
import { LoginCLI } from './cli/login';
import { OperationType, DBRecord, Snapshot, CloudUser } from './types';

export class ChronoDB {
  private log: LogEngine;
  private index: IndexManager;
  private version: VersionManager;
  public snapshots: SnapshotManager;
  private restore: RestoreEngine;
  private syncEngine: SyncEngine;
  public cli: { login: LoginCLI };
  
  private intervalTimer: any = null;
  private collections: Map<string, Collection> = new Map();

  constructor(autoSnapshotIntervalMs: number = 120000) {
    this.log = new LogEngine();
    this.index = new IndexManager();
    this.version = new VersionManager();
    this.snapshots = new SnapshotManager();
    this.restore = new RestoreEngine(this.index, this.version);
    this.syncEngine = new SyncEngine();
    this.cli = { login: new LoginCLI() };

    this.boot();

    if (autoSnapshotIntervalMs > 0) {
      this.intervalTimer = setInterval(() => {
        this.snapshots.createSnapshot(this.version.getCurrent(), 'interval');
      }, autoSnapshotIntervalMs);
    }
  }

  static async open(config: { path?: string, snapshots?: any } = {}) {
    const interval = config.snapshots?.interval === '2m' ? 120000 : (config.snapshots?.interval || 0);
    return new ChronoDB(interval);
  }

  private boot() {
    const records = this.log.readAll();
    let maxV = 0;
    records.forEach(r => {
      this.index.update(r);
      if (r.version > maxV) maxV = r.version;
    });
    this.version.setVersion(maxV);
  }

  col(name: string): Collection {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Collection(name, this));
    }
    return this.collections.get(name)!;
  }

  async _internalWrite(op: OperationType, collection: string, id: string, data: any): Promise<DBRecord> {
    const v = this.version.getNext();
    const record = this.log.append(op, collection, id, data, v);
    this.index.update(record);
    this.snapshots.incrementWrite();
    
    const user = this.cli.login.getUser();
    if (user?.isLoggedIn) {
      await this.syncEngine.sync(this.log.readAll(), this.version.getCurrent(), user);
    }

    return record;
  }

  _internalIndex() {
    return this.index;
  }

  async restoreToSnapshot(snapshotId: string) {
    const snaps = this.snapshots.list();
    const target = snaps.find(s => s.snapshot_id === snapshotId);
    if (!target) throw new Error('Snapshot not found');

    const records = this.log.readAll();
    await this.restore.restoreToVersion(target.version, records);
    this.snapshots.createSnapshot(this.version.getCurrent(), 'restore');
  }

  getInternalState() {
    return {
      version: this.version.getCurrent(),
      stats: this.index.getStats(),
      rawLog: this.log.getRawLog(),
      rawSnapshots: this.snapshots.getMetaRaw(),
      indexEntries: this.index.getEntries(),
      collectionNames: this.index.getCollectionNames(),
      user: this.cli.login.getUser()
    };
  }

  cleanup() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
  }
}
