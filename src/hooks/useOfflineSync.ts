import { useEffect, useCallback } from 'react';
import { indexedDBManager } from '../api/offline/indexedDB';
import { syncManager } from '../api/offline/syncManager';
import { networkStatus } from '../utils/networkStatus';

export const useOfflineSync = () => {
  const saveBeneficiary = useCallback(async (beneficiary: any) => {
    await indexedDBManager.saveBeneficiary(beneficiary);
    
    if (networkStatus.isOnline()) {
      await syncManager.syncPendingBeneficiaries();
    }
  }, []);

  useEffect(() => {
    // Initial sync attempt when component mounts
    if (networkStatus.isOnline()) {
      syncManager.syncPendingBeneficiaries();
    }
  }, []);

  return { saveBeneficiary };
};
