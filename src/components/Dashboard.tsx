import { useState, useRef, useEffect } from 'react';
import { SubjectCard } from './SubjectCard';
import { QuestTimer } from './QuestTimer';
import { SubjectCreator } from './SubjectCreator';
import { useAnimations } from '../hooks/useAnimations';
import { useUnifiedGestures } from '../hooks/useGestures';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import type { SubjectData, Session } from '../types';

interface DashboardProps {
  subjects: Record<string, SubjectData>;
  pipCounts: Record<string, number>;
  todayMinutes: Record<string, number>;
  onAddSubject: (config: any) => void;
  onAddSession: (session: Omit<Session, 'id'>) => void;
  onPipClick: (subjectId: string) => void;
}

export function Dashboard({ 
  subjects, 
  pipCounts, 
  todayMinutes,
  onAddSubject, 
  onAddSession, 
  onPipClick 
}: DashboardProps) {
  const [activeQuest, setActiveQuest] = useState<SubjectData | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Performance monitoring
  usePerformanceMonitor({
    componentName: 'Dashboard',
    logThreshold: 16
  });
  
  // Animation hooks for enhanced interactions
  const { staggeredEntrance, bounce, pulse } = useAnimations();
  
  // Gesture support for card interactions
  const { attachUnifiedGestures } = useUnifiedGestures({
    onDoubleTap: () => {
      setShowCreator(true);
    },
    onLongPress: () => {
      // Could open settings or quick actions menu
      console.log('Long press detected on dashboard');
    }
  });
  
  // Attach gestures and apply entrance animations
  useEffect(() => {
    if (dashboardRef.current) {
      const cleanup = attachUnifiedGestures(dashboardRef.current);
      
      // Apply staggered entrance animation to subject cards
      const cards = dashboardRef.current.querySelectorAll('.card');
      if (cards.length > 0) {
        staggeredEntrance(Array.from(cards) as HTMLElement[], 'slideUp', 150);
      }
      
      return cleanup;
    }
  }, [attachUnifiedGestures, staggeredEntrance, Object.keys(subjects).length]);


  const handleStartQuest = (subjectData: SubjectData) => {
    setActiveQuest(subjectData);
    
    // Add subtle animation feedback
    const questCards = dashboardRef.current?.querySelectorAll('.card');
    questCards?.forEach((card) => {
      if (card instanceof HTMLElement) {
        pulse(card, { duration: 300 });
      }
    });
  };

  const handleQuickAdd = (subjectId: string, minutes: number) => {
    const subject = subjects[subjectId];
    if (!subject) return;

    const questType = minutes >= 60 ? 'hard' : minutes >= 30 ? 'medium' : 'easy';
    const session: Omit<Session, 'id'> = {
      subjectId,
      duration: minutes,
      date: new Date().toISOString().slice(0, 10),
      notes: 'Quick add',
      questType
    };

    onAddSession(session);
    
    // Add bounce animation to the subject card
    const subjectCard = dashboardRef.current?.querySelector(`[data-subject-id="${subjectId}"]`);
    if (subjectCard instanceof HTMLElement) {
      bounce(subjectCard, { duration: 500 });
    }
  };

  const handleManualAdd = (subjectId: string, minutes: number, questType: string, notes: string) => {
    const session: Omit<Session, 'id'> = {
      subjectId,
      duration: minutes,
      date: new Date().toISOString().slice(0, 10),
      notes,
      questType
    };

    onAddSession(session);
  };

  const subjectArray = Object.values(subjects);

  if (subjectArray.length === 0) {
    return (
      <>
        <div className="container">
          <div className="empty-state" style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            background: 'var(--surface)',
            borderRadius: 'var(--r)',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h2>Welcome to Modular ADHD Learning RPG!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Create your first learning subject to get started on your journey.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowCreator(true)}
              style={{ fontSize: '16px', padding: '12px 24px' }}
            >
              ➕ Create Your First Subject
            </button>
          </div>
        </div>

        <SubjectCreator
          isOpen={showCreator}
          onClose={() => setShowCreator(false)}
          onSave={(config) => {
            onAddSubject(config);
            setShowCreator(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div ref={dashboardRef} className="container touch-friendly">
        <div className="dashboard-header hover-lift" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0 }}>Your Learning Journey</h2>
          <button 
            className="btn btn-primary hover-scale touch-feedback animate-button-press"
            onClick={() => setShowCreator(true)}
          >
            ➕ Add Subject
          </button>
        </div>

        <div className="grid animate-stagger-children">
          {subjectArray.map((subjectData, index) => (
            <div 
              key={subjectData.config.id}
              className="subject-card-wrapper hover-lift"
              data-subject-id={subjectData.config.id}
            >
              <SubjectCard
                subjectData={subjectData}
                todayMinutes={todayMinutes[subjectData.config.id] || 0}
              pipCount={pipCounts[subjectData.config.id] || 0}
              onStartQuest={() => handleStartQuest(subjectData)}
              onQuickAdd={(minutes) => handleQuickAdd(subjectData.config.id, minutes)}
              onManualAdd={(minutes, questType, notes) => 
                handleManualAdd(subjectData.config.id, minutes, questType, notes)
              }
                onPipClick={() => onPipClick(subjectData.config.id)}
                animationDelay={index * 100}
              />
            </div>
          ))}
        </div>
      </div>

      <QuestTimer
        isOpen={!!activeQuest}
        subjectData={activeQuest}
        onClose={() => setActiveQuest(null)}
        onComplete={(session) => {
          onAddSession(session);
          setActiveQuest(null);
        }}
      />

      <SubjectCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onSave={(config) => {
          onAddSubject(config);
          setShowCreator(false);
        }}
      />
    </>
  );
}