import React, { useState } from 'react';
import { Subject } from '../types';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
}

const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, onAddSubject }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#667eea'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSubject({
      name: formData.name,
      color: formData.color,
      xp: 0,
      totalSessions: 0,
      streak: 0,
      createdAt: new Date().toISOString()
    });
    setFormData({ name: '', color: '#667eea' });
    setShowForm(false);
  };

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    margin: '16px 0'
  };

  return (
    <div>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>📚 Your Study Subjects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {showForm ? '❌ Cancel' : '➕ Add Subject'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ 
            background: '#f8f9fa', 
            padding: '24px', 
            borderRadius: '12px', 
            marginBottom: '24px' 
          }}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Subject name (e.g., Spanish, Math, Guitar)"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: '500' }}>Choose a color:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      background: color,
                      border: formData.color === color ? '3px solid #333' : '2px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              ✨ Create Subject
            </button>
          </form>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {subjects.map(subject => (
            <div
              key={subject.id}
              style={{
                background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}10)`,
                border: `2px solid ${subject.color}40`,
                borderRadius: '12px',
                padding: '20px',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '12px',
                  height: '12px',
                  background: subject.color,
                  borderRadius: '50%'
                }}
              />
              
              <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>{subject.name}</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                <span>🎆 {subject.xp} XP</span>
                <span>📅 {subject.totalSessions} sessions</span>
                <span>🔥 {subject.streak} streak</span>
              </div>
              
              <div style={{ 
                marginTop: '12px', 
                background: '#f0f0f0', 
                borderRadius: '6px', 
                height: '6px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: subject.color,
                  height: '100%',
                  width: `${Math.min((subject.xp % 100) / 100 * 100, 100)}%`,
                  borderRadius: '6px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#888' }}>
                {subject.xp % 100}/100 XP to next level
              </p>
            </div>
          ))}
          
          {subjects.length === 0 && !showForm && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontSize: '1.1rem'
            }}>
              🌱 No subjects yet. Create your first one to start learning!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectManager;