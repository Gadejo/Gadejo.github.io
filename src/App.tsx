import React, { useState, useEffect } from 'react';
import { User, Subject, Session, AppState } from './types';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    subjects: [],
    sessions: [],
    isLoading: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const user = await response.json();
          await loadUserData(user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadUserData = async (user: User) => {
    try {
      const [subjectsRes, sessionsRes] = await Promise.all([
        fetch('/api/data/subjects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch('/api/data/sessions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        })
      ]);
      
      const subjects = await subjectsRes.json();
      const sessions = await sessionsRes.json();
      
      setState({
        user,
        subjects: subjects || [],
        sessions: sessions || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setState(prev => ({ ...prev, user, isLoading: false }));
    }
  };

  const handleLogin = (user: User) => {
    loadUserData(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setState({
      user: null,
      subjects: [],
      sessions: [],
      isLoading: false
    });
  };

  if (state.isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: 'white'
      }}>
        ⚡ Loading your adventure...
      </div>
    );
  }

  if (!state.user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      state={state} 
      setState={setState}
      onLogout={handleLogout}
    />
  );
};

export default App;