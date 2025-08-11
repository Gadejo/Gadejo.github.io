import type { AppData } from '../types';
import type { SyncState, SyncOperation, CloudData, SyncResult } from '../types/sync';

class SyncService {
  private readonly PENDING_SYNC_KEY = 'adhd_rpg_pending_sync';
  private readonly LAST_SYNC_KEY = 'adhd_rpg_last_sync';

  private isOnline(): boolean {
    return navigator.onLine;
  }

  async syncData(localData: AppData, userId: string): Promise<SyncResult> {
    if (!this.isOnline()) {
      // Queue operations for later sync
      await this.queueSyncOperations(localData, userId);
      return {
        success: false,
        message: 'Offline - changes queued for sync when online'
      };
    }

    try {
      // Mock API call - replace with real implementation
      await this.mockSyncToCloud(localData, userId);
      
      // Update last sync time
      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      
      // Clear pending operations
      localStorage.removeItem(this.PENDING_SYNC_KEY);

      return {
        success: true,
        message: 'Data synced successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async downloadData(userId: string): Promise<AppData | null> {
    if (!this.isOnline()) {
      return null;
    }

    try {
      // Mock API call
      const cloudData = await this.mockDownloadFromCloud(userId);
      return cloudData ? this.extractAppData(cloudData) : null;
    } catch (error) {
      console.error('Download failed:', error);
      return null;
    }
  }

  private async queueSyncOperations(data: AppData, userId: string): Promise<void> {
    const operations: SyncOperation[] = [];
    const timestamp = new Date().toISOString();

    // Create operations for all data changes
    Object.entries(data.subjects).forEach(([id, subject]) => {
      operations.push({
        id: `sync_${Date.now()}_${Math.random()}`,
        type: 'UPDATE',
        entityType: 'subject',
        entityId: id,
        data: subject,
        timestamp,
        userId
      });
    });

    data.sessions.forEach(session => {
      operations.push({
        id: `sync_${Date.now()}_${Math.random()}`,
        type: 'UPDATE',
        entityType: 'session',
        entityId: session.id,
        data: session,
        timestamp,
        userId
      });
    });

    // Store pending operations
    const existing = this.getPendingOperations();
    const updated = [...existing, ...operations];
    localStorage.setItem(this.PENDING_SYNC_KEY, JSON.stringify(updated));
  }

  private getPendingOperations(): SyncOperation[] {
    const stored = localStorage.getItem(this.PENDING_SYNC_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private async mockSyncToCloud(data: AppData, userId: string): Promise<CloudData> {
    // Simulate network delay
    await this.delay(1500);
    
    const cloudData: CloudData = {
      ...data,
      userId,
      version: data.version || '1.0.0',
      lastModified: new Date().toISOString(),
      syncOperations: []
    };

    return cloudData;
  }

  private async mockDownloadFromCloud(_userId: string): Promise<CloudData | null> {
    await this.delay(1000);
    
    // Return null to simulate no cloud data (first time user)
    return null;
  }

  private extractAppData(cloudData: CloudData): AppData {
    const { userId, lastModified, syncOperations, ...appData } = cloudData;
    return appData;
  }

  getSyncState(): SyncState {
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    const pendingOps = this.getPendingOperations();

    return {
      isOnline: this.isOnline(),
      isSyncing: false,
      lastSyncAt: lastSync,
      pendingChanges: pendingOps.length,
      syncError: null
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const syncService = new SyncService();