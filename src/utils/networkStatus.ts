export class NetworkStatusManager {
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    window.addEventListener('online', () => this.notifyListeners(true));
    window.addEventListener('offline', () => this.notifyListeners(false));
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  addListener(listener: (online: boolean) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (online: boolean) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }
}

export const networkStatus = new NetworkStatusManager();
