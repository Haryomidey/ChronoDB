
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
  isSynced?: boolean;
}

export interface CloudUser {
  id: string;
  email: string;
  token: string;
  isLoggedIn: boolean;
  createdAt: number;
}

export type AuthMode = 'login' | 'signup' | 'forgot';

export type Filter = Record<string, any>;

export interface Config {
  path: string;
  token?: string;
  user?: {
    email: string;
    id: string;
  };
}
