
export enum OperationType {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete'
}

export interface DBRecord {
  op: OperationType;
  collection: string;
  id: string;
  data: any | null;
  version: number;
  timestamp: number;
  checksum: string;
}

export interface Snapshot {
  snapshot_id: string;
  version: number;
  timestamp: number;
  reason: 'interval' | 'manual' | 'restore';
  writesSinceLast: number;
}

export interface CloudUser {
  email: string;
  token: string;
  isLoggedIn: boolean;
}

export type AuthMode = 'login' | 'signup' | 'forgot';

export type Filter = Record<string, any>;