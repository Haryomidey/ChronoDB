
import { DBRecord, OperationType } from '../types';
import { vfs } from '../vfs';

export class LogEngine {
  private logPath: string = 'data.log';

  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; 
    }
    return hash.toString(16);
  }

  append(op: OperationType, collection: string, id: string, data: any, version: number): DBRecord {
    const record: DBRecord = {
      op,
      collection,
      id,
      data,
      version,
      timestamp: Date.now(),
      checksum: ''
    };
    
    record.checksum = this.calculateChecksum({ op, collection, id, data, version, timestamp: record.timestamp });
    
    const entry = JSON.stringify(record) + '\n';
    vfs.appendFileSync(this.logPath, entry);
    
    return record;
  }

  readAll(): DBRecord[] {
    const raw = vfs.readFileSync(this.logPath);
    if (!raw) return [];
    
    return raw.trim().split('\n').map(line => {
      try {
        return JSON.parse(line) as DBRecord;
      } catch (e) {
        throw new Error('Database log corruption detected');
      }
    });
  }

  getRawLog() {
    return vfs.readFileSync(this.logPath);
  }
}
