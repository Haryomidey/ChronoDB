import { ChronoDB } from '../../server';
import { OperationType, DBRecord, Filter } from '../types';
import { generateId } from '../utils/crypto';

export class Collection {
  constructor(
    private name: string,
    private db: ChronoDB
  ) {}

  async add<T = any>(data: T): Promise<DBRecord> {
    const id = (data as any)._id || generateId();
    const doc = { ...(data as any), _id: id };
    return this.db._internalWrite(OperationType.INSERT, this.name, id, doc);
  }

  async get<T = any>(filter: Filter | string): Promise<T | null> {
    const all = await this.all<T>();
    if (typeof filter === 'string') {
      return all.find((d: any) => d._id === filter) || null;
    }
    return all.find((doc: any) => {
      return Object.entries(filter).every(([key, value]) => doc[key] === value);
    }) || null;
  }

  async all<T = any>(): Promise<T[]> {
    return this.db._internalIndex().getAll(this.name).map(r => r.data as T);
  }

  async update<T = any>(filter: Filter | string, partialData: Partial<T>): Promise<DBRecord | null> {
    const target = await this.get<any>(filter);
    if (!target) return null;

    const id = target._id;
    const newData = { ...target, ...partialData, _id: id };
    return this.db._internalWrite(OperationType.UPDATE, this.name, id, newData);
  }

  async remove(filter: Filter | string): Promise<DBRecord | null> {
    const target = await this.get<any>(filter);
    if (!target) return null;

    return this.db._internalWrite(OperationType.DELETE, this.name, target._id, null);
  }
}