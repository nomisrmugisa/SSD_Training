import { useEffect, useCallback } from 'react';
import { indexedDBManager } from '../api/offline/indexedDB';
import { syncManager } from '../api/offline/syncManager';
import { networkStatus } from '../utils/networkStatus';

export const useOfflineSync = () => {
  const saveEvent = useCallback(async (event: any) => {
    await indexedDBManager.saveEvent(event);
    
    if (networkStatus.isOnline()) {
      await syncManager.syncPendingEvents();
    }
  }, []);

  useEffect(() => {
    // Initial sync attempt when component mounts
    if (networkStatus.isOnline()) {
      syncManager.syncPendingEvents();
    }
  }, []);

  return { saveEvent };
};
