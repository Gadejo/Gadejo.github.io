import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppData } from './hooks/useAppData';
import { Dashboard } from './components/Dashboard';

import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

// Import critical components normally to avoid lazy loading issues
import { Goals } from './components/Goals';
import { EnhancedResources } from './components/EnhancedResources';
import { EnhancedStats } from './components/EnhancedStats';
import { EnhancedToast, EnhancedConfetti, XPNotification, AchievementNotification } from './components/EnhancedToast';
import { PWASettings } from './components/PWASettings';
import { useUnifiedGestures } from './hooks/useGestures';
import { useAnimations } from './hooks/useAnimations';
import { LevelingSystem } from './services/levelingSystem';
import { AchievementEngine } from './services/achievementSystem';
import { ExportImport } from './components/ExportImport';
import { TemplateManager } from './components/TemplateManager';
import { UserProfile } from './components/UserProfile';

// Keep critical components synchronous
import AuthScreen from './components/AuthScreen';
import DataMigration from './components/DataMigration';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader, DashboardSkeleton } from './components/LoadingStates';
import { authService } from './services/auth';
import { settingsService } from './services/settings';
import { hasLocalStorageData } from './utils/storage';
import type { SubjectConfig, Template, AppData } from './types';
import type { UserSettings } from './services/settings';
import './styles/design-system.css';
import './styles/index.css';
import './styles/mobile-responsive.css';
import './styles/advanced-animations.css';

function App() {
  // Performance monitoring
  const { startMeasurement, endMeasurement } = usePerformanceMonitor({
    componentName: 'App',
    logThreshold: 20
  });

  useEffect(() => {
    startMeasurement();
    return endMeasurement;
  }, [startMeasurement, endMeasurement]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const {
    data,
    setData,
    addSubject,
    addSession,
    addGoal,
    updateGoal,
    removeGoal,
    setPipCount,
    isLoading: dataLoading
  } = useAppData();

  const [currentView, setCurrentView] = useState('dashboard');
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type: 'success' | 'error' | 'warning' | 'info' }>({ message: '', isVisible: false, type: 'success' });
  const [confetti, setConfetti] = useState({ isActive: false });
  const [xpNotification, setXpNotification] = useState({ xp: 0, isVisible: false, position: { x: 0, y: 0 } });
  const [achievementNotification, setAchievementNotification] = useState({ 
    title: '', 
    description: '', 
    icon: '', 
    isVisible: false 
  });
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showPWASettings, setShowPWASettings] = useState(false);

  // Animation and gesture hooks
  const { fadeIn, slideLeft, slideRight } = useAnimations();
  
  // Suppress unused variable warnings for now
  void fadeIn; void slideLeft; void slideRight;
  const appRef = useRef<HTMLDivElement>(null);
  
  // Gamification systems
  const levelingSystem = LevelingSystem.getInstance();
  const achievementEngine = AchievementEngine.getInstance();

  const showToast = useCallback((message: string) => {
    setToast({ message, isVisible: true, type: 'success' });
  }, []);

  const showEnhancedToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type });
  }, []);

  // Enhanced gesture navigation with memoized callbacks
  const onSwipeLeft = useCallback(() => {
    const views = ['dashboard', 'goals', 'resources', 'stats', 'settings'];
    const currentIndex = views.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % views.length;
    setCurrentView(views[nextIndex]);
    showEnhancedToast('Swiped to next view! 👉');
  }, [currentView, showEnhancedToast]);

  const onSwipeRight = useCallback(() => {
    const views = ['dashboard', 'goals', 'resources', 'stats', 'settings'];
    const currentIndex = views.indexOf(currentView);
    const prevIndex = currentIndex === 0 ? views.length - 1 : currentIndex - 1;
    setCurrentView(views[prevIndex]);
    showEnhancedToast('Swiped to previous view! 👈');
  }, [currentView, showEnhancedToast]);

  const { attachUnifiedGestures } = useUnifiedGestures({
    onSwipeLeft,
    onSwipeRight,
    threshold: 80
  });

  // Enhanced authentication and settings initialization
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize session with enhanced validation
        const isValid = await authService.initializeSession();
        
        if (isValid) {
          setIsAuthenticated(true);
          // Use improved migration detection - only show if there's meaningful data
          const needsMigration = hasLocalStorageData();
          console.log('Migration check:', { needsMigration, user: authService.getDisplayName() });
          setShowMigration(needsMigration);
        } else {
          // Session invalid or doesn't exist
          setIsAuthenticated(false);
        }

        // Initialize settings (works for both authenticated and guest users)
        const userSettings = await settingsService.initialize();
        setSettings(userSettings);

      } catch (error) {
        console.error('App initialization error:', error);
        setIsAuthenticated(false);
        // Still try to load default settings
        const defaultSettings = await settingsService.initialize();
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Subscribe to settings changes
  useEffect(() => {
    if (!settings) return;

    const unsubscribe = settingsService.subscribe((updatedSettings) => {
      setSettings(updatedSettings);
    });

    return unsubscribe;
  }, [settings]);

  const handleLogin = async (shouldShowMigrationOrUserId: boolean | string) => {
    // Handle guest mode login
    if (shouldShowMigrationOrUserId === 'guest-mode') {
      try {
        await authService.loginAsGuest();
        setIsAuthenticated(true);
        setShowMigration(false); // Guests don't need migration
        
        // Load default settings for guest
        const guestSettings = await settingsService.loadSettings();
        setSettings(guestSettings);
        return;
      } catch (error) {
        console.error('Guest login failed:', error);
        return;
      }
    }

    // Handle regular login
    const shouldShowMigration = shouldShowMigrationOrUserId as boolean;
    setIsAuthenticated(true);
    // Check both parameter and our improved detection
    const needsMigration = shouldShowMigration && hasLocalStorageData();
    console.log('Login migration check:', { shouldShowMigration, actualNeed: hasLocalStorageData(), final: needsMigration });
    setShowMigration(needsMigration);

    // Reload settings for the authenticated user
    try {
      const userSettings = await settingsService.loadSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load user settings after login:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setShowMigration(false);
    
    // Reset to default settings for guest mode
    try {
      const defaultSettings = await settingsService.loadSettings();
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to load default settings after logout:', error);
    }
  };

  const handleMigrationComplete = () => {
    console.log('Migration completed, hiding migration screen');
    setShowMigration(false);
    // Force a data reload instead of full page reload
    window.location.reload();
  };


  const showXPNotification = useCallback((xp: number, position?: { x: number; y: number }) => {
    setXpNotification({ 
      xp, 
      isVisible: true, 
      position: position || { x: window.innerWidth / 2, y: 100 } 
    });
  }, []);

  const showAchievementNotification = useCallback((title: string, description: string, icon: string) => {
    setAchievementNotification({ title, description, icon, isVisible: true });
    setConfetti({ isActive: true }); // Trigger confetti for achievements
  }, []);
  
  // Calculate current user level and XP
  const totalXP = Object.values(data?.subjects || {}).reduce((sum, subject) => sum + (subject.totalXP || 0), 0) + 
                  achievementEngine.getTotalAchievementXP();
  const userLevel = levelingSystem.getUserLevel(totalXP);

  const showConfetti = () => {
    setConfetti({ isActive: true });
  };

  const handleAddSubject = (config: SubjectConfig) => {
    addSubject(config);
    showToast(`${config.name} subject created! 🎉`);
  };

  const handleAddSession = (session: Omit<any, 'id'>) => {
    addSession(session);
    const subject = data?.subjects[session.subjectId];
    
    if (subject) {
      const questType = subject.config.questTypes.find(q => q.id === session.questType);
      const xpGained = questType?.xp || 0;
      
      // Show XP notification with animation
      showXPNotification(xpGained);
      showEnhancedToast(`+${session.duration}m to ${subject.config.name}! 🌟`);
      
      // Check for milestone achievements
      const newTotalMinutes = (subject.totalMinutes || 0) + session.duration;
      const milestones = [60, 300, 600, 1200]; // 1hr, 5hr, 10hr, 20hr
      
      for (const milestone of milestones) {
        if (subject.totalMinutes < milestone && newTotalMinutes >= milestone) {
          const hours = milestone / 60;
          showAchievementNotification(
            `${hours}H Study Champion!`,
            `You've studied ${subject.config.name} for ${hours} hours!`,
            '🏆'
          );
          break;
        }
      }
      
      // Confetti for longer sessions or achievements
      if (session.duration >= 30) {
        showConfetti();
      }
    }
  };

  const handlePipClick = (subjectId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const currentPips = data?.pips?.[today]?.[subjectId] || 0;
    
    if (currentPips >= 3) {
      showToast('All pips used today');
      return;
    }

    const subject = data?.subjects?.[subjectId];
    if (!subject) return;

    setPipCount(subjectId, today, currentPips + 1);
    
    // Add a mini session for the pip
    const pipSession = {
      subjectId,
      duration: subject.config.pipAmount,
      date: today,
      notes: 'Daily pip',
      questType: 'easy'
    };
    
    addSession(pipSession);
    showToast(`+${subject.config.pipAmount}m pip! 🌟`);
  };

  const getPipCounts = () => {
    const today = new Date().toISOString().slice(0, 10);
    const result: Record<string, number> = {};
    
    Object.keys(data?.subjects || {}).forEach(subjectId => {
      result[subjectId] = data?.pips?.[today]?.[subjectId] || 0;
    });
    
    return result;
  };

  const getTodayMinutes = () => {
    const today = new Date().toISOString().slice(0, 10);
    const result: Record<string, number> = {};
    
    Object.keys(data?.subjects || {}).forEach(subjectId => {
      const todaysSessions = data?.sessions?.filter(session => 
        session.subjectId === subjectId && session.date === today
      ) || [];
      result[subjectId] = todaysSessions.reduce((total, session) => total + session.duration, 0);
    });
    
    return result;
  };

  const handleApplyTemplate = (template: Template) => {
    // Preserve existing subjects and their progress data
    const newSubjects: Record<string, any> = {};
    
    template.subjects.forEach(subjectConfig => {
      const existingSubject = data?.subjects?.[subjectConfig.id];
      
      if (existingSubject) {
        // Keep existing progress, update config
        newSubjects[subjectConfig.id] = {
          ...existingSubject,
          config: subjectConfig
        };
      } else {
        // New subject, start with fresh progress
        newSubjects[subjectConfig.id] = {
          config: subjectConfig,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          achievementLevel: 0,
          lastStudyDate: null,
          totalXP: 0
        };
      }
    });

    const newData: AppData = {
      ...data,
      subjects: newSubjects,
      sessions: data?.sessions || [],
      pips: data?.pips || {},
      preferences: data?.preferences || { dark: false },
      version: data?.version || '4.1.0',
      // Keep existing sessions and goals, but add template defaults if none exist
      goals: data?.goals && data.goals.length > 0 ? data.goals : template.defaultGoals?.map(goal => ({
        ...goal,
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        subjectId: template.subjects[0]?.id || ''
      })) || []
    };

    setData(newData);
    showToast(`Template applied: ${template.name} 🎨`);
  };

  // Attach gestures to app container
  useEffect(() => {
    if (appRef.current) {
      const cleanup = attachUnifiedGestures(appRef.current);
      return cleanup;
    }
    // Return empty cleanup function if no element
    return () => {};
  }, [attachUnifiedGestures]);

  // Render different states based on loading/auth status
  const renderContent = () => {
    if (isLoading || dataLoading || !settings) {
      return (
        <PageLoader 
          message="Loading your learning journey..." 
          icon="🧠"
        />
      );
    }

    // Show login screen if not authenticated
    if (!isAuthenticated) {
      return <AuthScreen onLogin={handleLogin} />;
    }

    // Show migration screen if needed (with debug info)
    if (showMigration) {
      console.log('Showing migration screen');
      return <DataMigration onMigrationComplete={handleMigrationComplete} />;
    }

    // Show loading if data hasn't loaded yet
    if (!data) {
      return (
        <PageLoader 
          message="Setting up your workspace..." 
          icon="📚"
        />
      );
    }

    // Main app content
    return (
      <div className="container max-w-7xl mx-auto px-4 py-6 animate-fade-in safe-area-insets">
        <ErrorBoundary fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <p className="text-red-800">Header failed to load. Please refresh the page.</p>
          </div>
        }>
          <header className="card shadow-lg mb-8 animate-slide-down" style={{ backdropFilter: 'blur(12px)' }}>
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <div className="title">
                  <div style={{ 
                    padding: 'var(--spacing-3)', 
                    background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-info-500))', 
                    borderRadius: 'var(--radius-2xl)', 
                    boxShadow: 'var(--shadow-lg)',
                    display: 'inline-block',
                    marginRight: 'var(--spacing-4)'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-2xl)' }}>🎮</span>
                  </div>
                  <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <h1>ADHD Learning RPG</h1>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      <span className="badge badge-success">
                        v4.1 • Professional
                      </span>
                    </div>
                  </div>
                </div>
              
                <div className="actions">
                  <label className="chip">
                    <input 
                      type="checkbox" 
                      id="dark-mode-toggle"
                      name="darkMode"
                      checked={settings?.theme === 'dark'}
                      onChange={() => settingsService.toggleDarkMode()}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: 'var(--font-size-lg)' }}>🌙</span>
                    <span>Dark</span>
                  </label>
                  
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setShowUserProfile(true)}
                    title="View Profile"
                  >
                    <span style={{ marginRight: 'var(--spacing-1)' }}>{userLevel.icon}</span>
                    Level {userLevel.level}
                  </button>
                  
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowTemplateManager(true)}>
                    <span style={{ marginRight: 'var(--spacing-1)' }}>🎨</span>
                    Templates
                  </button>
                  
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowPWASettings(true)}>
                    <span style={{ marginRight: 'var(--spacing-1)' }}>⚡</span>
                    PWA
                  </button>

                  <button className="btn btn-secondary btn-sm" onClick={handleLogout} title="Sign Out">
                    <span style={{ marginRight: 'var(--spacing-1)' }}>🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <nav className="nav-container">
              <button 
                className={`tab ${currentView === 'dashboard' ? 'tab-active' : ''}`}
                data-view="dashboard"
                aria-current={currentView === 'dashboard' ? 'page' : 'false'}
                onClick={() => setCurrentView('dashboard')}
              >
                <span>🏠</span>
                Dashboard
              </button>
              <button 
                className={`tab ${currentView === 'goals' ? 'tab-active' : ''}`}
                data-view="goals"
                aria-current={currentView === 'goals' ? 'page' : 'false'}
                onClick={() => setCurrentView('goals')}
              >
                <span>🎯</span>
                Goals
              </button>
              <button 
                className={`tab ${currentView === 'resources' ? 'tab-active' : ''}`}
                data-view="resources"
                aria-current={currentView === 'resources' ? 'page' : 'false'}
                onClick={() => setCurrentView('resources')}
              >
                <span>🔗</span>
                Resources
              </button>
              <button 
                className={`tab ${currentView === 'stats' ? 'tab-active' : ''}`}
                data-view="stats"
                aria-current={currentView === 'stats' ? 'page' : 'false'}
                onClick={() => setCurrentView('stats')}
              >
                <span>📊</span>
                Stats
              </button>
              <button 
                className={`tab ${currentView === 'settings' ? 'tab-active' : ''}`}
                data-view="settings"
                aria-current={currentView === 'settings' ? 'page' : 'false'}
                onClick={() => setCurrentView('settings')}
              >
                <span>⚙️</span>
                Settings
              </button>
            </nav>
          </header>
        </ErrorBoundary>

        <main className="view-container">
          {currentView === 'dashboard' && (
            <ErrorBoundary fallback={<DashboardSkeleton />}>
              <div className="view-content entrance-fade" key="dashboard">
                <Dashboard
                  subjects={data!.subjects}
                  pipCounts={getPipCounts()}
                  todayMinutes={getTodayMinutes()}
                  onAddSubject={handleAddSubject}
                  onAddSession={handleAddSession}
                  onPipClick={handlePipClick}
                />
              </div>
            </ErrorBoundary>
          )}
          
          {currentView === 'goals' && (
            <ErrorBoundary fallback={
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-gray-600">Goals failed to load</p>
              </div>
            }>
              <div className="view-content entrance-slide-left" key="goals">
                <Goals
                    subjects={data!.subjects}
                    goals={data!.goals}
                    sessions={data!.sessions}
                    onAddGoal={addGoal}
                    onUpdateGoal={updateGoal}
                    onRemoveGoal={removeGoal}
                    onStartQuest={(subjectId) => {
                      // This would open the quest timer for the specific subject
                      // For now, just show a toast
                      const subject = data?.subjects?.[subjectId];
                      if (subject) showToast(`Starting quest for ${subject.config.name}!`);
                    }}
                    onQuickAdd={(subjectId, minutes) => {
                      const questType = minutes >= 60 ? 'hard' : minutes >= 30 ? 'medium' : 'easy';
                      const session = {
                        subjectId,
                        duration: minutes,
                        date: new Date().toISOString().slice(0, 10),
                        notes: 'Quick add from goals',
                        questType
                      };
                      addSession(session);
                      showToast(`+${minutes}m added!`);
                    }}
                    onShowToast={showToast}
                    onShowConfetti={showConfetti}
                  />
              </div>
            </ErrorBoundary>
          )}

          {currentView === 'resources' && (
            <ErrorBoundary fallback={
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔗</div>
                <p className="text-gray-600">Resources failed to load</p>
              </div>
            }>
              <div className="view-content entrance-slide-up" key="resources">
                <EnhancedResources
                    subjects={data!.subjects}
                    onShowToast={showToast}
                  />
              </div>
            </ErrorBoundary>
          )}

          {currentView === 'stats' && (
            <ErrorBoundary fallback={
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600">Statistics failed to load</p>
              </div>
            }>
              <div className="view-content entrance-zoom" key="stats">
                <EnhancedStats
                    subjects={data!.subjects}
                    sessions={data!.sessions}
                  />
              </div>
            </ErrorBoundary>
          )}

          {currentView === 'settings' && (
            <ErrorBoundary fallback={
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚙️</div>
                <p className="text-gray-600">Settings failed to load</p>
              </div>
            }>
              <div className="view-content entrance-slide-right" key="settings">
                <ExportImport
                    data={data}
                    onImport={setData}
                    onShowToast={showToast}
                  />
              </div>
            </ErrorBoundary>
          )}
        </main>

        <footer className="mt-8 py-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400">
            <span className="text-green-500">✨</span>
            Enhanced • Cloud Sync • Error-Protected • Professional Grade
            <span className="text-blue-500">🚀</span>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div 
        ref={appRef}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 touch-none"
      >
        {renderContent()}
      </div>

      <EnhancedToast 
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, isVisible: false }))}
        position="top-right"
      />

      <XPNotification
        xp={xpNotification.xp}
        isVisible={xpNotification.isVisible}
        position={xpNotification.position}
        onComplete={() => setXpNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <AchievementNotification
        title={achievementNotification.title}
        description={achievementNotification.description}
        icon={achievementNotification.icon}
        isVisible={achievementNotification.isVisible}
        onComplete={() => setAchievementNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <EnhancedConfetti
        isActive={confetti.isActive}
        onComplete={() => setConfetti({ isActive: false })}
        particleCount={80}
        duration={4000}
      />

      {showTemplateManager && (
        <TemplateManager
          isOpen={showTemplateManager}
          onClose={() => setShowTemplateManager(false)}
          onApplyTemplate={handleApplyTemplate}
          onShowToast={showToast}
        />
      )}
      
      {showUserProfile && (
        <UserProfile
          subjects={data!.subjects}
          sessions={data!.sessions}
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          onShowToast={showEnhancedToast}
          onXPUpdate={(newXP) => {
            // In a real implementation, you'd update the subject XP in the backend
            console.log('XP updated:', newXP);
          }}
        />
      )}
      
      <PWASettings
        isOpen={showPWASettings}
        onClose={() => setShowPWASettings(false)}
        onShowToast={showEnhancedToast}
      />
    </ErrorBoundary>
  );
}

export default App;