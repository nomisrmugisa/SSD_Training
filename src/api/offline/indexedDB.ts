export const DB_NAME = 'ssdTrainingDB';
export const DB_VERSION = 1;

interface DBSchema {
  beneficiaries: {
    key: string;
    value: any;
    indexes: {
      savedOnline: boolean,
      timestamp: number;
    };
  };
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (beneficiary) => {
        const db = (beneficiary.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('beneficiaries')) {
          const store = db.createObjectStore('beneficiaries', { keyPath: 'id' });
          store.createIndex('savedOnline', 'savedOnline', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveBeneficiary(beneficiary: any): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['beneficiaries'], 'readwrite');
      const store = transaction.objectStore('beneficiaries');

      const beneficiaryWithMeta = {
        ...beneficiary,
        savedOnline: false,
        timestamp: Date.now(),
      };

      const request = store.put(beneficiaryWithMeta);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getUnsyncedBeneficiaries(): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['beneficiaries'], 'readonly');
      const store = transaction.objectStore('beneficiaries');
      const index = store.index('savedOnline');
      const request = index.getAll(IDBKeyRange.only(false));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async markBeneficiaryAsSynced(beneficiaryId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['beneficiaries'], 'readwrite');
      const store = transaction.objectStore('beneficiaries');
      const request = store.get(beneficiaryId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const beneficiary = request.result;
        if (beneficiary) {
          beneficiary.savedOnline = true; // Update the savedOnline flag
          store.put(beneficiary); // Save the updated beneficiary
        }
        resolve();
      };
    });
  }

  async getOfflineCount(): Promise<number> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['beneficiaries'], 'readonly');
      const store = transaction.objectStore('beneficiaries');
      const index = store.index('savedOnline'); // Use the index for savedOnline

      // Count the number of entries where savedOnline is false
      const request = index.count(IDBKeyRange.only(false));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export const indexedDBManager = new IndexedDBManager();
