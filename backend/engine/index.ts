
import { DBRecord, OperationType } from '../types';

export class IndexManager {
  private collections: Map<string, Map<string, DBRecord>> = new Map();

  update(record: DBRecord) {
    if (!this.collections.has(record.collection)) {
      this.collections.set(record.collection, new Map());
    }
    
    const colMap = this.collections.get(record.collection)!;

    if (record.op === OperationType.DELETE) {
      colMap.delete(record.id);
    } else {
      colMap.set(record.id, record);
    }
  }

  get(collection: string, id: string): DBRecord | undefined {
    return this.collections.get(collection)?.get(id);
  }

  getAll(collection: string): DBRecord[] {
    const colMap = this.collections.get(collection);
    return colMap ? Array.from(colMap.values()) : [];
  }

  clear() {
    this.collections.clear();
  }

  getCollectionNames() {
    return Array.from(this.collections.keys());
  }

  getStats() {
    const stats: Record<string, number> = {};
    this.collections.forEach((map, name) => {
      stats[name] = map.size;
    });
    return stats;
  }

  getEntries() {
    const entries: any[] = [];
    this.collections.forEach((map, collectionName) => {
      map.forEach((record, id) => {
        entries.push({ collectionName, id, record });
      });
    });
    return entries;
  }
}
