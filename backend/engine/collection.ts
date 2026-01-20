import { ChronoDB } from '../ChronoDB';
import { OperationType, DBRecord, Filter } from '../types';

export class Collection {
  constructor(
    private name: string,
    private db: ChronoDB
  ) {}

  async add(data: any): Promise<DBRecord> {
    const id = data._id || `doc_${Math.random().toString(36).substr(2, 9)}`;
    const doc = { ...data, _id: id };
    return this.db._internalWrite(OperationType.INSERT, this.name, id, doc);
  }

  async get(filter: Filter | string): Promise<any | null> {
    const all = await this.all();
    if (typeof filter === 'string') {
      return all.find(d => d._id === filter) || null;
    }
    return all.find(doc => {
      return Object.entries(filter).every(([key, value]) => doc[key] === value);
    }) || null;
  }

  async all(): Promise<any[]> {
    return this.db._internalIndex().getAll(this.name).map(r => r.data);
  }

  async update(filter: Filter | string, partialData: any): Promise<DBRecord | null> {
    const target = await this.get(filter);
    if (!target) return null;

    const id = target._id;
    const newData = { ...target, ...partialData, _id: id };
    return this.db._internalWrite(OperationType.UPDATE, this.name, id, newData);
  }

  async remove(filter: Filter | string): Promise<DBRecord | null> {
    const target = await this.get(filter);
    if (!target) return null;

    return this.db._internalWrite(OperationType.DELETE, this.name, target._id, null);
  }
}