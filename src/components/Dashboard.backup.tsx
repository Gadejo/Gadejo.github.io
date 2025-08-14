import React, { useState } from 'react';
import { AppState, Subject, Session } from '../types';
import StudyTimer from './StudyTimer';
import SubjectManager from './SubjectManager';
import ProgressStats from './ProgressStats';

interface DashboardProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setState, onLogout }) => {
  const [activeView, setActiveView] = useState<'overview' | 'study' | 'subjects'>('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { user, subjects, sessions } = state;

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const response = await fetch('/api/data/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(subject)
      });
      
      if (response.ok) {
        const newSubject = await response.json();
        setState(prev => ({
          ...prev,
          subjects: [...prev.subjects, newSubject]
        }));
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
    }
  };

  const addSession = async (session: Omit<Session, 'id'>) => {
    try {
      const response = await fetch('/api/data/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(session)
      });
      
      if (response.ok) {
        const newSession = await response.json();
        setState(prev => ({
          ...prev,
          sessions: [...prev.sessions, newSession],
          subjects: prev.subjects.map(s => 
            s.id === session.subjectId 
              ? { ...s, xp: s.xp + session.xpEarned, totalSessions: s.totalSessions + 1 }
              : s
          ),
          user: prev.user ? {
            ...prev.user,
            totalXp: prev.user.totalXp + session.xpEarned,
            level: Math.floor((prev.user.totalXp + session.xpEarned) / 100) + 1
          } : null
        }));
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const headerStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '20px',
    margin: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  };

  const navButtonStyle = (active: boolean) => ({
    padding: '12px 24px',
    margin: '0 8px',
    border: 'none',
    borderRadius: '12px',
    background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
    color: active ? 'white' : '#666',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ minHeight: '100vh', padding: '0' }}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ 
            fontSize: '1.8rem', 
            margin: '0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎮 Study RPG
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Level {user?.level} • {user?.totalXp} XP • {user?.username}
          </p>
        </div>
        
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            style={navButtonStyle(activeView === 'overview')}
            onClick={() => setActiveView('overview')}
          >
            📈 Overview
          </button>
          <button 
            style={navButtonStyle(activeView === 'study')}
            onClick={() => setActiveView('study')}
          >
            📚 Study
          </button>
          <button 
            style={navButtonStyle(activeView === 'subjects')}
            onClick={() => setActiveView('subjects')}
          >
            ⚙️ Subjects
          </button>
          <button 
            style={{
              padding: '12px 24px',
              margin: '0 8px',
              border: '2px solid #ff6b6b',
              borderRadius: '12px',
              background: 'transparent',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            onClick={onLogout}
          >
            🚪 Logout
          </button>
        </nav>
      </header>

      <main style={{ padding: '0 20px 20px' }}>
        {activeView === 'overview' && (
          <ProgressStats 
            user={user!} 
            subjects={subjects} 
            sessions={sessions} 
          />
        )}
        
        {activeView === 'study' && (
          <StudyTimer 
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onSessionComplete={addSession}
          />
        )}
        
        {activeView === 'subjects' && (
          <SubjectManager 
            subjects={subjects}
            onAddSubject={addSubject}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;