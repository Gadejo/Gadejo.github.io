import React from 'react';
import { User, Subject, Session } from '../types';

interface ProgressStatsProps {
  user: User;
  subjects: Subject[];
  sessions: Session[];
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ user, subjects, sessions }) => {
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(session => 
    new Date(session.completedAt).toDateString() === today
  );
  
  const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0);
  const totalSessions = sessions.length;
  const todayXP = todaySessions.reduce((total, session) => total + session.xpEarned, 0);
  const todayTime = todaySessions.reduce((total, session) => total + session.duration, 0);
  
  const nextLevelXP = (user.level * 100);
  const currentLevelProgress = user.totalXp % 100;
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    margin: '16px 0'
  };
  
  const statCardStyle = {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
    border: '1px solid #dee2e6'
  };
  
  const getSubjectStats = () => {
    return subjects.map(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      const totalTime = subjectSessions.reduce((total, session) => total + session.duration, 0);
      return {
        ...subject,
        totalTime,
        sessionCount: subjectSessions.length
      };
    }).sort((a, b) => b.xp - a.xp);
  };
  
  const subjectStats = getSubjectStats();
  
  return (
    <div>
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 24px 0', color: '#333' }}>📈 Your Learning Journey</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎆</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' }}>
              Level {user.level}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              {currentLevelProgress}/100 XP to next level
            </div>
            <div style={{
              marginTop: '12px',
              background: '#e9ecef',
              borderRadius: '6px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                height: '100%',
                width: `${currentLevelProgress}%`,
                borderRadius: '6px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
          
          <div style={statCardStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⏱️</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#43e97b' }}>
              {formatTime(totalStudyTime)}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Study Time</div>
          </div>
          
          <div style={statCardStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📅</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f093fb' }}>
              {totalSessions}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Sessions</div>
          </div>
          
          <div style={statCardStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌟</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffeaa7' }}>
              {user.totalXp}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total XP Earned</div>
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #667eea20 0%, #764ba210 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🌅 Today's Progress</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                +{todayXP} XP
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>XP Earned Today</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#43e97b' }}>
                {formatTime(todayTime)}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Time Studied Today</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f093fb' }}>
                {todaySessions.length}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Sessions Today</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 24px 0', color: '#333' }}>📚 Subject Rankings</h2>
        {subjectStats.length > 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {subjectStats.map((subject, index) => (
              <div
                key={subject.id}
                style={{
                  background: `linear-gradient(135deg, ${subject.color}15, ${subject.color}08)`,
                  border: `2px solid ${subject.color}30`,
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    background: subject.color,
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    marginRight: '16px'
                  }}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', color: '#333' }}>{subject.name}</h3>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      {subject.sessionCount} sessions • {formatTime(subject.totalTime)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: subject.color }}>
                    {subject.xp} XP
                  </div>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>
                    Level {Math.floor(subject.xp / 100) + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '1.1rem'
          }}>
            🌱 Create your first subject to start tracking progress!
          </div>
        )}
      </div>
      
      {sessions.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 24px 0', color: '#333' }}>📅 Recent Sessions</h2>
          <div style={{ display: 'grid', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {sessions.slice(-10).reverse().map(session => {
              const subject = subjects.find(s => s.id === session.subjectId);
              const date = new Date(session.completedAt);
              
              return (
                <div
                  key={session.id}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: subject ? `2px solid ${subject.color}30` : '2px solid #dee2e6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {subject && (
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: subject.color,
                        borderRadius: '50%',
                        marginRight: '12px'
                      }} />
                    )}
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {subject?.name || 'Unknown Subject'}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#43e97b' }}>
                      +{session.xpEarned} XP
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {formatTime(session.duration)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressStats;