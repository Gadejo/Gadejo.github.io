import React, { useState, useEffect, useRef } from 'react';
import { Subject, Session } from '../types';

interface StudyTimerProps {
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject | null) => void;
  onSessionComplete: (session: Omit<Session, 'id'>) => void;
}

interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  sessionType: 'focus' | 'break';
}

const StudyTimer: React.FC<StudyTimerProps> = ({ 
  subjects, 
  selectedSubject, 
  onSelectSubject, 
  onSessionComplete 
}) => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    sessionType: 'focus'
  });
  
  const [showCelebration, setShowCelebration] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.isRunning && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timer.timeLeft === 0 && timer.isRunning) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.isRunning, timer.timeLeft]);

  const handleTimerComplete = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
    
    if (timer.sessionType === 'focus' && selectedSubject) {
      const xpEarned = Math.floor(timer.totalTime / 60) * 10;
      
      onSessionComplete({
        subjectId: selectedSubject.id,
        duration: timer.totalTime,
        xpEarned,
        completedAt: new Date().toISOString()
      });
      
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    playNotificationSound();
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const startTimer = () => {
    if (!selectedSubject && timer.sessionType === 'focus') {
      alert('Please select a subject first!');
      return;
    }
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setTimer(prev => ({ 
      ...prev, 
      isRunning: false, 
      timeLeft: prev.totalTime 
    }));
  };

  const setTimerDuration = (minutes: number, type: 'focus' | 'break') => {
    const seconds = minutes * 60;
    setTimer({
      isRunning: false,
      timeLeft: seconds,
      totalTime: seconds,
      sessionType: type
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((timer.totalTime - timer.timeLeft) / timer.totalTime) * 100;

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    margin: '16px 0',
    textAlign: 'center' as const
  };

  return (
    <div>
      {showCelebration && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          color: 'white',
          fontSize: '3rem',
          animation: 'pulse 1s infinite'
        }}>
          🎉 Session Complete! +{Math.floor(timer.totalTime / 60) * 10} XP! 🎉
        </div>
      )}
      
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 24px 0', color: '#333' }}>⏱️ Study Timer</h2>
        
        {!selectedSubject && timer.sessionType === 'focus' && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#666', marginBottom: '16px' }}>Select a subject to start studying:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => onSelectSubject(subject)}
                  style={{
                    padding: '12px 20px',
                    background: `linear-gradient(135deg, ${subject.color}90, ${subject.color}70)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {selectedSubject && timer.sessionType === 'focus' && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#666' }}>Studying:</p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: `linear-gradient(135deg, ${selectedSubject.color}20, ${selectedSubject.color}10)`,
              border: `2px solid ${selectedSubject.color}40`,
              borderRadius: '12px',
              padding: '12px 20px',
              margin: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: selectedSubject.color,
                borderRadius: '50%',
                marginRight: '8px'
              }} />
              <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{selectedSubject.name}</span>
              <button
                onClick={() => onSelectSubject(null)}
                style={{
                  marginLeft: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: timer.sessionType === 'focus' ? '#667eea' : '#43e97b',
            marginBottom: '16px',
            fontFamily: 'monospace'
          }}>
            {formatTime(timer.timeLeft)}
          </div>
          
          <div style={{
            width: '100%',
            maxWidth: '300px',
            height: '8px',
            background: '#f0f0f0',
            borderRadius: '4px',
            margin: '0 auto 16px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: timer.sessionType === 'focus' 
                ? 'linear-gradient(90deg, #667eea, #764ba2)'
                : 'linear-gradient(90deg, #43e97b, #38f9d7)',
              borderRadius: '4px',
              transition: 'width 1s ease'
            }} />
          </div>
          
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {timer.sessionType === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
          </p>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          {!timer.isRunning ? (
            <button
              onClick={startTimer}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: '600',
                marginRight: '12px'
              }}
            >
              ▶️ Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: '600',
                marginRight: '12px'
              }}
            >
              ⏸️ Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#333',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}
          >
            🔄 Reset
          </button>
        </div>
        
        <div>
          <p style={{ color: '#666', marginBottom: '12px' }}>Quick presets:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => setTimerDuration(5, 'focus')} style={presetButtonStyle}>5m Focus</button>
            <button onClick={() => setTimerDuration(15, 'focus')} style={presetButtonStyle}>15m Focus</button>
            <button onClick={() => setTimerDuration(25, 'focus')} style={presetButtonStyle}>25m Focus</button>
            <button onClick={() => setTimerDuration(45, 'focus')} style={presetButtonStyle}>45m Focus</button>
            <button onClick={() => setTimerDuration(5, 'break')} style={presetButtonStyle}>5m Break</button>
            <button onClick={() => setTimerDuration(15, 'break')} style={presetButtonStyle}>15m Break</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const presetButtonStyle = {
  padding: '8px 16px',
  background: '#f8f9fa',
  border: '2px solid #e1e5e9',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem'
};

export default StudyTimer;