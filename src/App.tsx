import { useState, useEffect } from 'react';
import { useAppData } from './hooks/useAppData';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { EnhancedResources } from './components/EnhancedResources';
import { Stats } from './components/Stats';
import { Toast, Confetti } from './components/Toast';
import { ExportImport } from './components/ExportImport';
import { TemplateManager } from './components/TemplateManager';
import type { SubjectConfig, Template, AppData } from './types';
import './styles/index.css';

function App() {
  const {
    data,
    setData,
    addSubject,
    addSession,
    addGoal,
    updateGoal,
    removeGoal,
    setPipCount,
    toggleDarkMode
  } = useAppData();

  const [currentView, setCurrentView] = useState('dashboard');
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [confetti, setConfetti] = useState({ isActive: false });
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme', 
      data.preferences.dark ? 'dark' : 'light'
    );
  }, [data.preferences.dark]);

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const showConfetti = () => {
    setConfetti({ isActive: true });
  };

  const handleAddSubject = (config: SubjectConfig) => {
    addSubject(config);
    showToast(`${config.name} subject created! 🎉`);
  };

  const handleAddSession = (session: Omit<any, 'id'>) => {
    addSession(session);
    const subject = data.subjects[session.subjectId];
    
    if (subject) {
      const questType = subject.config.questTypes.find(q => q.id === session.questType);
      showToast(`+${session.duration}m to ${subject.config.name}! ${questType?.xp || 0} XP gained 🌟`);
      
      // Check for achievement level up
      // This would be better handled in the useAppData hook
      // For now, just show confetti for longer sessions
      if (session.duration >= 30) {
        showConfetti();
      }
    }
  };

  const handlePipClick = (subjectId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const currentPips = data.pips[today]?.[subjectId] || 0;
    
    if (currentPips >= 3) {
      showToast('All pips used today');
      return;
    }

    const subject = data.subjects[subjectId];
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
    
    Object.keys(data.subjects).forEach(subjectId => {
      result[subjectId] = data.pips[today]?.[subjectId] || 0;
    });
    
    return result;
  };

  const getTodayMinutes = () => {
    const today = new Date().toISOString().slice(0, 10);
    const result: Record<string, number> = {};
    
    Object.keys(data.subjects).forEach(subjectId => {
      const todaysSessions = data.sessions.filter(session => 
        session.subjectId === subjectId && session.date === today
      );
      result[subjectId] = todaysSessions.reduce((total, session) => total + session.duration, 0);
    });
    
    return result;
  };

  const handleApplyTemplate = (template: Template) => {
    // Preserve existing subjects and their progress data
    const newSubjects: Record<string, any> = {};
    
    template.subjects.forEach(subjectConfig => {
      const existingSubject = data.subjects[subjectConfig.id];
      
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
      // Keep existing sessions and goals, but add template defaults if none exist
      goals: data.goals.length > 0 ? data.goals : template.defaultGoals?.map(goal => ({
        ...goal,
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        subjectId: template.subjects[0]?.id || ''
      })) || []
    };

    setData(newData);
    showToast(`Template applied: ${template.name} 🎨`);
  };


  return (
    <>
      <div className="container">
        <header>
          <div className="title">
            <span style={{ fontSize: '22px' }}>🎮</span>
            <div>
              Modular ADHD Learning RPG
              <div className="badge">v4.0 • modular</div>
            </div>
          </div>
          
          <div className="actions">
            <label className="chip">
              <input 
                type="checkbox" 
                checked={data.preferences.dark}
                onChange={toggleDarkMode}
                style={{ verticalAlign: 'middle' }}
              />
              🌙 Dark
            </label>
            
            <button className="btn" onClick={() => setShowTemplateManager(true)}>
              🎨 Templates
            </button>
          </div>

          <nav>
            <button 
              className="tab" 
              data-view="dashboard"
              aria-current={currentView === 'dashboard' ? 'page' : 'false'}
              onClick={() => setCurrentView('dashboard')}
            >
              🏠 Dashboard
            </button>
            <button 
              className="tab" 
              data-view="goals"
              aria-current={currentView === 'goals' ? 'page' : 'false'}
              onClick={() => setCurrentView('goals')}
            >
              🎯 Goals
            </button>
            <button 
              className="tab" 
              data-view="resources"
              aria-current={currentView === 'resources' ? 'page' : 'false'}
              onClick={() => setCurrentView('resources')}
            >
              🔗 Resources
            </button>
            <button 
              className="tab" 
              data-view="stats"
              aria-current={currentView === 'stats' ? 'page' : 'false'}
              onClick={() => setCurrentView('stats')}
            >
              📊 Stats
            </button>
            <button 
              className="tab" 
              data-view="settings"
              aria-current={currentView === 'settings' ? 'page' : 'false'}
              onClick={() => setCurrentView('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>
        </header>

        <main className="view-container">
          {currentView === 'dashboard' && (
            <div className="view-content" key="dashboard">
              <Dashboard
                subjects={data.subjects}
                pipCounts={getPipCounts()}
                todayMinutes={getTodayMinutes()}
                onAddSubject={handleAddSubject}
                onAddSession={handleAddSession}
                onPipClick={handlePipClick}
              />
            </div>
          )}
          
          {currentView === 'goals' && (
            <div className="view-content" key="goals">
              <Goals
                subjects={data.subjects}
                goals={data.goals}
                sessions={data.sessions}
                onAddGoal={addGoal}
                onUpdateGoal={updateGoal}
                onRemoveGoal={removeGoal}
                onStartQuest={(subjectId) => {
                  // This would open the quest timer for the specific subject
                  // For now, just show a toast
                  const subject = data.subjects[subjectId];
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
          )}

          {currentView === 'resources' && (
            <div className="view-content" key="resources">
              <EnhancedResources
                subjects={data.subjects}
                onShowToast={showToast}
              />
            </div>
          )}

          {currentView === 'stats' && (
            <div className="view-content" key="stats">
              <Stats
                subjects={data.subjects}
                sessions={data.sessions}
              />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="view-content" key="settings">
              <ExportImport
                data={data}
                onImport={setData}
                onShowToast={showToast}
              />
            </div>
          )}
        </main>

        <footer>
          <span className="pill">
            Modular • Local-only • No accounts • Build your perfect learning system
          </span>
        </footer>
      </div>

      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        onHide={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <Confetti
        isActive={confetti.isActive}
        onComplete={() => setConfetti({ isActive: false })}
      />

      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onApplyTemplate={handleApplyTemplate}
        onShowToast={showToast}
      />
    </>
  );
}

export default App;