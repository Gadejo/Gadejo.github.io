import { useState } from 'react';
import { SubjectCard } from './SubjectCard';
import { QuestTimer } from './QuestTimer';
import { SubjectCreator } from './SubjectCreator';
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


  const handleStartQuest = (subjectData: SubjectData) => {
    setActiveQuest(subjectData);
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
      <div className="container">
        <div className="dashboard-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0 }}>Your Learning Journey</h2>
          <button 
            className="btn"
            onClick={() => setShowCreator(true)}
          >
            ➕ Add Subject
          </button>
        </div>

        <div className="grid">
          {subjectArray.map((subjectData, index) => (
            <SubjectCard
              key={subjectData.config.id}
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