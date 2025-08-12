/**
 * PWA Service - Handles Progressive Web App features
 * Manages service worker, notifications, offline capabilities, and installation
 */

export interface PWACapabilities {
  serviceWorkerSupported: boolean;
  notificationsSupported: boolean;
  installPromptAvailable: boolean;
  backgroundSyncSupported: boolean;
  pushSupported: boolean;
  offlineStorageSupported: boolean;
}

export interface CacheInfo {
  totalSize: number;
  cacheCount: number;
  lastUpdated: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PWAService {
  private static instance: PWAService;
  private serviceWorker: ServiceWorker | null = null;
  private installPrompt: any = null;
  private capabilities: PWACapabilities;

  private constructor() {
    this.capabilities = this.detectCapabilities();
    this.initialize();
  }

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  // Detect PWA capabilities
  private detectCapabilities(): PWACapabilities {
    return {
      serviceWorkerSupported: 'serviceWorker' in navigator,
      notificationsSupported: 'Notification' in window,
      installPromptAvailable: false, // Will be set when prompt is available
      backgroundSyncSupported: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      pushSupported: 'serviceWorker' in navigator && 'PushManager' in window,
      offlineStorageSupported: 'caches' in window && 'indexedDB' in window
    };
  }

  // Initialize PWA features
  private async initialize() {
    if (this.capabilities.serviceWorkerSupported) {
      await this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupNotifications();
    }
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('PWA: Service Worker registered successfully');

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('PWA: Message from Service Worker:', event.data);
      });

      this.serviceWorker = registration.active;
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
    }
  }

  // Setup install prompt handling
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event;
      this.capabilities.installPromptAvailable = true;
      console.log('PWA: Install prompt available');
      
      // Notify app that install is available
      this.dispatchPWAEvent('install-available', { canInstall: true });
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.installPrompt = null;
      this.capabilities.installPromptAvailable = false;
      
      this.dispatchPWAEvent('app-installed', { installed: true });
    });
  }

  // Setup notification handling
  private setupNotifications() {
    if (this.capabilities.notificationsSupported) {
      // Request permission if not granted
      if (Notification.permission === 'default') {
        this.requestNotificationPermission();
      }
    }
  }

  // Show update notification
  private showUpdateNotification() {
    this.dispatchPWAEvent('update-available', { 
      updateAvailable: true,
      message: 'A new version of the app is available!' 
    });
  }

  // Dispatch PWA events
  private dispatchPWAEvent(type: string, detail: any) {
    const event = new CustomEvent(`pwa-${type}`, { detail });
    window.dispatchEvent(event);
  }

  // Public methods

  // Get PWA capabilities
  getCapabilities(): PWACapabilities {
    return { ...this.capabilities };
  }

  // Check if app is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Trigger install prompt
  async install(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('PWA: Install prompt not available');
      return false;
    }

    try {
      const result = await this.installPrompt.prompt();
      const accepted = result.outcome === 'accepted';
      
      if (accepted) {
        console.log('PWA: Install accepted');
      } else {
        console.log('PWA: Install declined');
      }

      this.installPrompt = null;
      return accepted;
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.capabilities.notificationsSupported) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('PWA: Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('PWA: Notification permission request failed:', error);
      return 'denied';
    }
  }

  // Show notification
  async showNotification(options: NotificationOptions): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('PWA: Notification permission not granted');
      return;
    }

    try {
      if (this.serviceWorker) {
        // Use service worker to show notification for better persistence
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(options.title, {
            body: options.body,
            icon: options.icon || '/vite.svg',
            badge: options.badge || '/vite.svg',
            tag: options.tag,
            requireInteraction: options.requireInteraction,
            silent: options.silent,
            // vibrate: options.vibrate, // Not supported in all browsers
            // actions: options.actions, // Actions only work with service worker notifications
            data: { timestamp: Date.now() }
          });
        }
      } else {
        // Fallback to regular notification
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/vite.svg',
          tag: options.tag
        });
      }
    } catch (error) {
      console.error('PWA: Show notification failed:', error);
    }
  }

  // Schedule study reminder
  async scheduleStudyReminder(delayMinutes: number = 60): Promise<void> {
    if (!this.capabilities.backgroundSyncSupported) {
      console.warn('PWA: Background sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const syncRegistration = registration as any; // Background sync is experimental
      if (registration && syncRegistration.sync) {
        // Schedule background sync for reminder
        await syncRegistration.sync.register('check-study-reminders');
        console.log('PWA: Study reminder scheduled for', delayMinutes, 'minutes');
      }
    } catch (error) {
      console.error('PWA: Schedule reminder failed:', error);
    }
  }

  // Get cache information
  async getCacheInfo(): Promise<CacheInfo> {
    if (!this.capabilities.offlineStorageSupported) {
      return { totalSize: 0, cacheCount: 0, lastUpdated: 'N/A' };
    }

    try {
      // Send message to service worker to get cache size
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve({
            totalSize: event.data.cacheSize || 0,
            cacheCount: event.data.cacheCount || 0,
            lastUpdated: new Date().toISOString()
          });
        };

        if (this.serviceWorker) {
          this.serviceWorker.postMessage({ type: 'GET_CACHE_SIZE' }, [channel.port2]);
        } else {
          resolve({ totalSize: 0, cacheCount: 0, lastUpdated: 'N/A' });
        }
      });
    } catch (error) {
      console.error('PWA: Get cache info failed:', error);
      return { totalSize: 0, cacheCount: 0, lastUpdated: 'Error' };
    }
  }

  // Clear cache
  async clearCache(): Promise<void> {
    if (!this.capabilities.offlineStorageSupported) {
      console.warn('PWA: Cache not supported');
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('PWA: Cache cleared successfully');
      
      this.dispatchPWAEvent('cache-cleared', { cleared: true });
    } catch (error) {
      console.error('PWA: Clear cache failed:', error);
    }
  }

  // Update service worker
  async updateServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('PWA: Service worker updated');
        
        if (registration.waiting) {
          // Tell waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    } catch (error) {
      console.error('PWA: Service worker update failed:', error);
    }
  }

  // Check online status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Setup offline/online event listeners
  setupOfflineHandling(onOffline: () => void, onOnline: () => void) {
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }

  // Format cache size for display
  formatCacheSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Register for push notifications (requires backend)
  async registerForPushNotifications(): Promise<string | null> {
    if (!this.capabilities.pushSupported) {
      console.warn('PWA: Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error('PWA: Service worker not registered');
        return null;
      }

      // This would require a VAPID public key from your backend
      // const subscription = await registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
      // });

      console.log('PWA: Push notifications would be registered here');
      return 'push-registration-token'; // Placeholder
    } catch (error) {
      console.error('PWA: Push notification registration failed:', error);
      return null;
    }
  }
}