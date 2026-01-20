import { DBRecord, OperationType } from '../types';
import { fsAdapter } from '../utils/fs-adapter';
import { calculateChecksum } from '../utils/crypto';
import * as path from 'path';

export class LogEngine {
  private logPath: string;

  constructor(dbPath: string = './chronodata') {
    this.logPath = path.join(dbPath, 'data.log');
  }

  append(op: OperationType, collection: string, id: string, data: any, version: number): DBRecord {
    const timestamp = Date.now();
    const checksum = calculateChecksum({ op, collection, id, data, version, timestamp });
    
    const record: DBRecord = {
      op,
      collection,
      id,
      data,
      version,
      timestamp,
      checksum
    };
    
    const entry = JSON.stringify(record) + '\n';
    fsAdapter.appendFileSync(this.logPath, entry);
    
    return record;
  }

  readAll(): DBRecord[] {
    const raw = fsAdapter.readFileSync(this.logPath);
    if (!raw) return [];
    
    return raw.trim().split('\n').filter(l => l).map(line => {
      try {
        return JSON.parse(line) as DBRecord;
      } catch (e) {
        console.error('Skipping corrupt record in log');
        return null;
      }
    }).filter(r => r !== null) as DBRecord[];
  }

  getRawLog() {
    return fsAdapter.readFileSync(this.logPath);
  }
}
