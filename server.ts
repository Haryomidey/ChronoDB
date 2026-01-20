import { LogEngine } from './backend/engine/log';
import { IndexManager } from './backend/engine/index';
import { VersionManager } from './backend/engine/version';
import { SnapshotManager } from './backend/engine/snapshot';
import { RestoreEngine } from './backend/engine/restore';
import { Collection } from './backend/engine/collection';
import { SyncEngine } from './backend/engine/sync';
import { LoginCLI } from './backend/cli/login';
import { OperationType, DBRecord, Snapshot, CloudUser } from './backend/types';

export interface ChronoConfig {
  path?: string;
  snapshots?: {
    interval?: number;
  };
}

export class ChronoDB {
  private log: LogEngine;
  private index: IndexManager;
  private version: VersionManager;
  public snapshots: SnapshotManager;
  private restoreEngine: RestoreEngine;
  private syncEngine: SyncEngine;
  public cli: { login: LoginCLI };
  
  private intervalTimer: any = null;
  private collections: Map<string, Collection> = new Map();

  constructor(config: ChronoConfig = {}) {
    const dbPath = config.path || './chronodata';
    const interval = config.snapshots?.interval || 0;
    
    this.log = new LogEngine(dbPath);
    this.index = new IndexManager();
    this.version = new VersionManager();
    this.snapshots = new SnapshotManager(dbPath);
    this.restoreEngine = new RestoreEngine(this.index, this.version);
    this.syncEngine = new SyncEngine();
    this.cli = { login: new LoginCLI() };

    this.boot();

    if (interval > 0) {
      this.intervalTimer = setInterval(() => {
        this.triggerSnapshot('interval');
      }, interval);
    }
  }

  static async open(config: ChronoConfig = {}) {
    return new ChronoDB(config);
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

  col<T = any>(name: string): Collection {
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
    return record;
  }

  async triggerSnapshot(reason: Snapshot['reason']) {
    const snap = this.snapshots.createSnapshot(this.version.getCurrent(), reason);
    if (snap) {
      await this.runSync();
    }
    return snap;
  }

  async runSync() {
    const user = this.cli.login.getUser();
    if (user?.isLoggedIn) {
      const currentSnaps = this.snapshots.list();
      const syncedSnaps = await this.syncEngine.sync(currentSnaps, user);
      this.snapshots.saveAll(syncedSnaps);
    }
  }

  _internalIndex() {
    return this.index;
  }

  async restoreToSnapshot(snapshotId: string) {
    const snaps = this.snapshots.list();
    const target = snaps.find(s => s.snapshot_id === snapshotId);
    if (!target) throw new Error('Snapshot not found');

    const records = this.log.readAll();
    await this.restoreEngine.restoreToVersion(target.version, records);
    this.triggerSnapshot('restore');
  }

  async deleteSnapshot(id: string) {
    const user = this.cli.login.getUser();
    this.snapshots.delete(id);
    if (user?.isLoggedIn) {
      await this.syncEngine.deleteRemoteSnapshot(id, user);
    }
  }

  async deleteAllSnapshots() {
    const user = this.cli.login.getUser();
    this.snapshots.deleteAll();
    if (user?.isLoggedIn) {
      await this.syncEngine.clearRemote(user);
    }
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
