import { useState, useEffect, useRef } from 'react';
import { useAnimations } from '../hooks/useAnimations';
import { Card, CardBody, CardHeader, PrimaryButton, SecondaryButton, Badge } from './ui';
import { PWAService, type PWACapabilities, type CacheInfo } from '../services/pwaService';

interface PWASettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function PWASettings({ isOpen, onClose, onShowToast }: PWASettingsProps) {
  const [capabilities, setCapabilities] = useState<PWACapabilities | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const pwaService = PWAService.getInstance();
  const { fadeIn, pulse, bounce } = useAnimations();

  useEffect(() => {
    if (isOpen) {
      loadPWAInfo();
      setupEventListeners();
      
      if (panelRef.current) {
        fadeIn(panelRef.current, { duration: 300 });
      }
    }
  }, [isOpen, fadeIn]);

  const loadPWAInfo = async () => {
    setIsLoading(true);
    
    try {
      const caps = pwaService.getCapabilities();
      const cache = await pwaService.getCacheInfo();
      
      setCapabilities(caps);
      setCacheInfo(cache);
      setIsInstalled(pwaService.isInstalled());
      setIsOnline(pwaService.isOnline());
      setNotificationPermission(Notification.permission);
    } catch (error) {
      console.error('Failed to load PWA info:', error);
      onShowToast('Failed to load PWA information', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    const handleInstallAvailable = () => {
      loadPWAInfo();
      onShowToast('App can now be installed!', 'info');
    };

    const handleAppInstalled = () => {
      loadPWAInfo();
      onShowToast('App installed successfully!', 'success');
    };

    const handleUpdateAvailable = () => {
      onShowToast('App update available! Refresh to get the latest version.', 'info');
    };

    const handleOffline = () => {
      setIsOnline(false);
      onShowToast('You are now offline. Some features may be limited.', 'warning');
    };

    const handleOnline = () => {
      setIsOnline(true);
      onShowToast('You are back online!', 'success');
    };

    // PWA event listeners
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-app-installed', handleAppInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    
    // Network status listeners
    const cleanupOfflineHandling = pwaService.setupOfflineHandling(handleOffline, handleOnline);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      cleanupOfflineHandling();
    };
  };

  const handleInstallApp = async () => {
    setIsLoading(true);
    
    try {
      const installed = await pwaService.install();
      if (installed) {
        onShowToast('Installing app...', 'info');
        
        // Animate install button
        const installBtn = document.querySelector('[data-action="install"]');
        if (installBtn) {
          bounce(installBtn as HTMLElement, { duration: 500 });
        }
      } else {
        onShowToast('App installation was cancelled', 'warning');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      onShowToast('Failed to install app', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNotifications = async () => {
    setIsLoading(true);
    
    try {
      const permission = await pwaService.requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        onShowToast('Notifications enabled!', 'success');
        
        // Show a test notification
        await pwaService.showNotification({
          title: 'Notifications Enabled!',
          body: 'You will now receive study reminders and achievement notifications.',
          icon: '/icon.svg',
          tag: 'notification-test'
        });
      } else {
        onShowToast('Notification permission denied', 'warning');
      }
    } catch (error) {
      console.error('Notification request failed:', error);
      onShowToast('Failed to enable notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    
    try {
      await pwaService.clearCache();
      await loadPWAInfo(); // Reload cache info
      onShowToast('Cache cleared successfully!', 'success');
      
      // Animate clear button
      const clearBtn = document.querySelector('[data-action="clear-cache"]');
      if (clearBtn) {
        pulse(clearBtn as HTMLElement, { duration: 300 });
      }
    } catch (error) {
      console.error('Clear cache failed:', error);
      onShowToast('Failed to clear cache', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateApp = async () => {
    setIsLoading(true);
    
    try {
      await pwaService.updateServiceWorker();
      onShowToast('App is updating... Please refresh the page.', 'info');
      
      // Auto-refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Update failed:', error);
      onShowToast('Failed to update app', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleReminder = async () => {
    try {
      if (notificationPermission !== 'granted') {
        onShowToast('Please enable notifications first', 'warning');
        return;
      }
      
      await pwaService.scheduleStudyReminder(60); // 1 hour
      onShowToast('Study reminder scheduled!', 'success');
    } catch (error) {
      console.error('Schedule reminder failed:', error);
      onShowToast('Failed to schedule reminder', 'error');
    }
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div ref={panelRef} className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">⚡ PWA Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Progressive Web App features and performance</p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardBody className="space-y-6 max-h-96 overflow-y-auto">
          {/* Connection Status */}
          <Card className={`${isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {!isOnline && (
                <p className="text-red-600 text-sm mt-2">
                  You're offline, but the app will continue to work with cached data.
                </p>
              )}
            </CardBody>
          </Card>

          {/* Installation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📱 Installation</h3>
            <Card>
              <CardBody>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Install as App</h4>
                    <p className="text-sm text-gray-600">Install ADHD Learning RPG as a native app on your device for the best experience.</p>
                  </div>
                  <div className="flex gap-2">
                    {isInstalled ? (
                      <Badge variant="success">✅ Installed</Badge>
                    ) : capabilities?.installPromptAvailable ? (
                      <PrimaryButton
                        onClick={handleInstallApp}
                        loading={isLoading}
                        data-action="install"
                      >
                        📱 Install App
                      </PrimaryButton>
                    ) : (
                      <p className="text-sm text-gray-500">Installation not available on this device/browser</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔔 Notifications</h3>
            <Card>
              <CardBody>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Study Reminders</h4>
                    <p className="text-sm text-gray-600 mb-2">Get notifications to remind you to study and celebrate achievements.</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge variant={
                        notificationPermission === 'granted' ? 'success' : 
                        notificationPermission === 'denied' ? 'error' : 'warning'
                      }>
                        {notificationPermission === 'granted' ? '✅ Enabled' : 
                         notificationPermission === 'denied' ? '❌ Blocked' : '⏳ Not Set'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {notificationPermission === 'granted' ? (
                      <SecondaryButton
                        size="sm"
                        onClick={handleScheduleReminder}
                      >
                        📅 Schedule Reminder
                      </SecondaryButton>
                    ) : (
                      <PrimaryButton
                        onClick={handleRequestNotifications}
                        loading={isLoading}
                      >
                        🔔 Enable Notifications
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Cache Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💾 Storage & Cache</h3>
            <Card>
              <CardBody>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Offline Storage</h4>
                    <p className="text-sm text-gray-600 mb-2">Manage cached data for offline functionality and performance.</p>
                    {cacheInfo && (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cache Size:</span>
                          <span className="font-medium">{pwaService.formatCacheSize(cacheInfo.totalSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Updated:</span>
                          <span className="font-medium">
                            {new Date(cacheInfo.lastUpdated).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <SecondaryButton
                      onClick={handleClearCache}
                      loading={isLoading}
                      data-action="clear-cache"
                    >
                      🗑️ Clear Cache
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={handleUpdateApp}
                      loading={isLoading}
                    >
                      🔄 Update App
                    </PrimaryButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🛠️ PWA Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <CardBody className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Service Worker</span>
                  <Badge variant={capabilities?.serviceWorkerSupported ? 'success' : 'error'}>
                    {capabilities?.serviceWorkerSupported ? '✅ Supported' : '❌ Not Supported'}
                  </Badge>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Push Notifications</span>
                  <Badge variant={capabilities?.pushSupported ? 'success' : 'error'}>
                    {capabilities?.pushSupported ? '✅ Supported' : '❌ Not Supported'}
                  </Badge>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Background Sync</span>
                  <Badge variant={capabilities?.backgroundSyncSupported ? 'success' : 'error'}>
                    {capabilities?.backgroundSyncSupported ? '✅ Supported' : '❌ Not Supported'}
                  </Badge>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Offline Storage</span>
                  <Badge variant={capabilities?.offlineStorageSupported ? 'success' : 'error'}>
                    {capabilities?.offlineStorageSupported ? '✅ Supported' : '❌ Not Supported'}
                  </Badge>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Performance Tips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Performance Tips</h3>
            <div className="space-y-3">
              <Card className="border-blue-200 bg-blue-50">
                <CardBody className="flex items-center gap-3">
                  <span className="text-lg">📱</span>
                  <span className="text-blue-800 text-sm">Install as an app for faster startup and better performance</span>
                </CardBody>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardBody className="flex items-center gap-3">
                  <span className="text-lg">🔄</span>
                  <span className="text-blue-800 text-sm">Keep the app updated for the latest features and optimizations</span>
                </CardBody>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardBody className="flex items-center gap-3">
                  <span className="text-lg">🔔</span>
                  <span className="text-blue-800 text-sm">Enable notifications to stay motivated with study reminders</span>
                </CardBody>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardBody className="flex items-center gap-3">
                  <span className="text-lg">💾</span>
                  <span className="text-blue-800 text-sm">Clear cache periodically if you experience issues</span>
                </CardBody>
              </Card>
            </div>
          </div>
        </CardBody>
      </div>

    </div>
  );
}