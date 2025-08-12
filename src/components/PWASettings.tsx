import { useState, useEffect, useRef } from 'react';
import { useAnimations } from '../hooks/useAnimations';
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

  const getCapabilityStatus = (supported: boolean) => (
    <span className={`capability-status ${supported ? 'supported' : 'not-supported'}`}>
      {supported ? '✅ Supported' : '❌ Not Supported'}
    </span>
  );

  if (!isOpen) return null;

  return (
    <div className="pwa-settings-overlay">
      <div ref={panelRef} className="pwa-settings-panel">
        <div className="pwa-header">
          <div className="header-content">
            <h2 className="panel-title">⚡ PWA Settings</h2>
            <p className="panel-subtitle">Progressive Web App features and performance</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <span className="close-icon">✕</span>
          </button>
        </div>

        <div className="pwa-content">
          {/* Connection Status */}
          <div className="status-section">
            <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span className="status-text">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {!isOnline && (
                <p className="offline-message">
                  You're offline, but the app will continue to work with cached data.
                </p>
              )}
            </div>
          </div>

          {/* Installation */}
          <div className="settings-section">
            <h3 className="section-title">📱 Installation</h3>
            <div className="feature-card">
              <div className="feature-info">
                <h4>Install as App</h4>
                <p>Install ADHD Learning RPG as a native app on your device for the best experience.</p>
              </div>
              <div className="feature-actions">
                {isInstalled ? (
                  <div className="install-status">
                    <span className="installed-badge">✅ Installed</span>
                  </div>
                ) : capabilities?.installPromptAvailable ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleInstallApp}
                    disabled={isLoading}
                    data-action="install"
                  >
                    📱 Install App
                  </button>
                ) : (
                  <div className="install-info">
                    <p>Installation not available on this device/browser</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-section">
            <h3 className="section-title">🔔 Notifications</h3>
            <div className="feature-card">
              <div className="feature-info">
                <h4>Study Reminders</h4>
                <p>Get notifications to remind you to study and celebrate achievements.</p>
                <div className="permission-status">
                  Status: <span className={`permission-badge ${notificationPermission}`}>
                    {notificationPermission === 'granted' ? '✅ Enabled' : 
                     notificationPermission === 'denied' ? '❌ Blocked' : '⏳ Not Set'}
                  </span>
                </div>
              </div>
              <div className="feature-actions">
                {notificationPermission === 'granted' ? (
                  <div className="notification-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleScheduleReminder}
                    >
                      📅 Schedule Reminder
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleRequestNotifications}
                    disabled={isLoading}
                  >
                    🔔 Enable Notifications
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cache Management */}
          <div className="settings-section">
            <h3 className="section-title">💾 Storage & Cache</h3>
            <div className="feature-card">
              <div className="feature-info">
                <h4>Offline Storage</h4>
                <p>Manage cached data for offline functionality and performance.</p>
                {cacheInfo && (
                  <div className="cache-stats">
                    <div className="cache-stat">
                      <span className="stat-label">Cache Size:</span>
                      <span className="stat-value">{pwaService.formatCacheSize(cacheInfo.totalSize)}</span>
                    </div>
                    <div className="cache-stat">
                      <span className="stat-label">Last Updated:</span>
                      <span className="stat-value">
                        {new Date(cacheInfo.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="feature-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleClearCache}
                  disabled={isLoading}
                  data-action="clear-cache"
                >
                  🗑️ Clear Cache
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateApp}
                  disabled={isLoading}
                >
                  🔄 Update App
                </button>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="settings-section">
            <h3 className="section-title">🛠️ PWA Capabilities</h3>
            <div className="capabilities-grid">
              <div className="capability-item">
                <span className="capability-name">Service Worker</span>
                {getCapabilityStatus(capabilities?.serviceWorkerSupported || false)}
              </div>
              <div className="capability-item">
                <span className="capability-name">Push Notifications</span>
                {getCapabilityStatus(capabilities?.pushSupported || false)}
              </div>
              <div className="capability-item">
                <span className="capability-name">Background Sync</span>
                {getCapabilityStatus(capabilities?.backgroundSyncSupported || false)}
              </div>
              <div className="capability-item">
                <span className="capability-name">Offline Storage</span>
                {getCapabilityStatus(capabilities?.offlineStorageSupported || false)}
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="settings-section">
            <h3 className="section-title">⚡ Performance Tips</h3>
            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-icon">📱</span>
                <span className="tip-text">Install as an app for faster startup and better performance</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔄</span>
                <span className="tip-text">Keep the app updated for the latest features and optimizations</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔔</span>
                <span className="tip-text">Enable notifications to stay motivated with study reminders</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">💾</span>
                <span className="tip-text">Clear cache periodically if you experience issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pwa-settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-md);
        }

        .pwa-settings-panel {
          background: var(--color-white);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--color-gray-200);
        }

        .pwa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
        }

        .panel-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .panel-subtitle {
          margin: var(--spacing-xs) 0 0 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .pwa-content {
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .status-section {
          background: var(--color-gray-50);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
        }

        .connection-status {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .connection-status.online {
          color: var(--color-green-700);
        }

        .connection-status.offline {
          color: var(--color-red-700);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-text {
          font-weight: 600;
          font-size: 1.125rem;
        }

        .offline-message {
          margin: 0;
          padding: var(--spacing-md);
          background: var(--color-yellow-50);
          border: 1px solid var(--color-yellow-200);
          border-radius: var(--border-radius);
          color: var(--color-yellow-800);
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .section-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .feature-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          gap: var(--spacing-lg);
        }

        .feature-info {
          flex: 1;
        }

        .feature-info h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .feature-info p {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--color-gray-600);
          line-height: 1.5;
        }

        .feature-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          align-items: flex-end;
        }

        .install-status, .install-info {
          text-align: right;
        }

        .installed-badge {
          background: var(--color-green-100);
          color: var(--color-green-700);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .permission-status {
          font-size: 0.875rem;
        }

        .permission-badge {
          font-weight: 600;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
        }

        .permission-badge.granted {
          background: var(--color-green-100);
          color: var(--color-green-700);
        }

        .permission-badge.denied {
          background: var(--color-red-100);
          color: var(--color-red-700);
        }

        .permission-badge.default {
          background: var(--color-yellow-100);
          color: var(--color-yellow-700);
        }

        .notification-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .cache-stats {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
        }

        .cache-stat {
          display: flex;
          justify-content: space-between;
          gap: var(--spacing-md);
        }

        .stat-label {
          color: var(--color-gray-600);
        }

        .stat-value {
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .capability-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
        }

        .capability-name {
          font-weight: 500;
          color: var(--color-gray-900);
        }

        .capability-status {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .capability-status.supported {
          color: var(--color-green-700);
        }

        .capability-status.not-supported {
          color: var(--color-red-700);
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .tip-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background: var(--color-blue-50);
          border: 1px solid var(--color-blue-200);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
        }

        .tip-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .tip-text {
          color: var(--color-blue-800);
          line-height: 1.5;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .pwa-settings-overlay {
            padding: 0;
          }
          
          .pwa-settings-panel {
            max-height: 100vh;
            border-radius: 0;
          }
          
          .pwa-header {
            border-radius: 0;
          }
          
          .feature-card {
            flex-direction: column;
            align-items: stretch;
          }
          
          .feature-actions {
            align-items: stretch;
          }
          
          .capabilities-grid {
            grid-template-columns: 1fr;
          }
          
          .notification-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}