
import { DBRecord } from '../types';
import { IndexManager } from './index';
import { VersionManager } from './version';

export class RestoreEngine {
  constructor(
    private index: IndexManager,
    private version: VersionManager
  ) {}

  async restoreToVersion(targetVersion: number, allRecords: DBRecord[]) {
    this.index.clear();
    let maxVersionSeen = 0;

    for (const record of allRecords) {
      if (record.version <= targetVersion) {
        this.index.update(record);
        maxVersionSeen = Math.max(maxVersionSeen, record.version);
      }
    }

    this.version.setVersion(maxVersionSeen);
  }
}
