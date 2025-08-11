import type { AppData } from './index';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  syncError: string | null;
}

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'subject' | 'session' | 'goal';
  entityId: string;
  data: any;
  timestamp: string;
  userId: string;
}

export interface CloudData extends AppData {
  userId: string;
  version: string;
  lastModified: string;
  syncOperations: SyncOperation[];
}

export interface SyncResult {
  success: boolean;
  message: string;
  conflictResolutions?: ConflictResolution[];
}

export interface ConflictResolution {
  entityType: string;
  entityId: string;
  resolution: 'LOCAL' | 'REMOTE' | 'MERGED';
  localData: any;
  remoteData: any;
  mergedData?: any;
}