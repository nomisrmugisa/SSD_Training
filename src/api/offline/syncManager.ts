import { indexedDBManager } from './indexedDB';
import { networkStatus } from '../../utils/networkStatus';

class SyncManager {
  private isSyncing = false;

  constructor() {
    // Start listening for online status changes
    networkStatus.addListener(this.handleNetworkChange.bind(this));
  }

  private async handleNetworkChange(online: boolean): Promise<void> {
    if (online) {
      await this.syncPendingBeneficiaries();
    }
  }

  async syncPendingBeneficiaries(): Promise<void> {
    if (this.isSyncing || !networkStatus.isOnline()) return;

    try {
      this.isSyncing = true;
      const unsyncedBeneficiaries = await indexedDBManager.getUnsyncedBeneficiaries();

      for (const beneficiary of unsyncedBeneficiaries) {
        try {
          // Send to online API
          await this.sendBeneficiaryToServer(beneficiary);
          // Mark as synced in IndexedDB
          await indexedDBManager.markBeneficiaryAsSynced(beneficiary.id);
        } catch (error) {
          console.error('Failed to sync beneficiary:', error);
          // Continue with next event even if one fails
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async sendBeneficiaryToServer(beneficiary: any): Promise<void> {
    if (beneficiary.type === 'CREATE_BENEFICIARY') {
      // Handle multiple payloads sequentially
      let lastResponse;
      for (const payload of beneficiary.payloads) {
        const response = await fetch(
          `${process.env.REACT_APP_DHIS2_BASE_URL}${payload.endpoint}`,
          {
            method: payload.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload.data),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to sync beneficiary: ${response.statusText}`);
        }

        lastResponse = await response.json();
        
        // If this is the first payload (trackedEntityInstance creation),
        // update the trackedEntityInstance ID in the second payload
        if (payload.endpoint === 'api/trackedEntityInstances') {
          const teiId = lastResponse.response.importSummaries[0].reference;
          beneficiary.payloads[1].data.trackedEntityInstance = teiId;
        }
      }
    } else {
      // Handle single payload beneficiary (existing code)
      const response = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync beneficiary: ${response.statusText}`);
      }
    }
  }
}

export const syncManager = new SyncManager();
