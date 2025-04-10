export const DB_NAME = 'ssdTrainingDB';
export const DB_VERSION = 1;

interface DBSchema {
  events: {
    key: string;
    value: any;
    indexes: {
      savedOnline: boolean;
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

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { keyPath: 'id' });
          store.createIndex('savedOnline', 'savedOnline', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveEvent(event: any): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');

      const eventWithMeta = {
        ...event,
        savedOnline: false,
        timestamp: Date.now(),
      };

      const request = store.put(eventWithMeta);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getUnsyncedEvents(): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      const index = store.index('savedOnline');
      const request = index.getAll(IDBKeyRange.only(false));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async markEventAsSynced(eventId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      const request = store.get(eventId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const event = request.result;
        event.savedOnline = true;
        store.put(event);
        resolve();
      };
    });
  }
}

export const indexedDBManager = new IndexedDBManager();
