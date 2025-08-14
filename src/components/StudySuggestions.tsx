import React, { useState, useEffect } from 'react';
import { Subject, Session, User } from '../types';

interface StudySuggestionsProps {
  user: User;
  subjects: Subject[];
  sessions: Session[];
}

interface Suggestion {
  id: string;
  type: 'motivation' | 'strategy' | 'subject' | 'timing';
  title: string;
  description: string;
  emoji: string;
  actionable: boolean;
}

const StudySuggestions: React.FC<StudySuggestionsProps> = ({ user, subjects, sessions }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [subjects, sessions]);

  const generateSuggestions = () => {
    setLoading(true);
    
    setTimeout(() => {
      const newSuggestions: Suggestion[] = [];
      
      // Analyze user patterns
      const today = new Date().toDateString();
      const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === today);
      const totalStudyTime = sessions.reduce((total, s) => total + s.duration, 0);
      const avgSessionLength = sessions.length > 0 ? totalStudyTime / sessions.length : 0;
      
      // Motivational suggestions based on progress
      if (user.level >= 5) {
        newSuggestions.push({
          id: '1',
          type: 'motivation',
          title: 'Level Master!',
          description: `Incredible! You've reached level ${user.level}. You're building serious learning momentum! 🚀`,
          emoji: '🏆',
          actionable: false
        });
      }
      
      if (todaySessions.length === 0) {
        newSuggestions.push({
          id: '2',
          type: 'motivation',
          title: 'Start Your Day Strong',
          description: 'Even a 5-minute session can kickstart your learning momentum for today!',
          emoji: '☀️',
          actionable: true
        });
      }
      
      // Subject-specific suggestions
      if (subjects.length === 0) {
        newSuggestions.push({
          id: '3',
          type: 'subject',
          title: 'Create Your First Subject',
          description: 'Start your learning journey! Popular choices: Language Learning, Programming, Math, or Creative Skills.',
          emoji: '🎯',
          actionable: true
        });
      } else if (subjects.length === 1) {
        newSuggestions.push({
          id: '4',
          type: 'subject',
          title: 'Diversify Your Learning',
          description: 'Consider adding a complementary subject! Cross-training your brain boosts overall learning.',
          emoji: '🌈',
          actionable: true
        });
      }
      
      // Strategy suggestions based on session patterns
      if (avgSessionLength > 1800) { // > 30 minutes
        newSuggestions.push({
          id: '5',
          type: 'strategy',
          title: 'Power Learner!',
          description: 'Your long sessions show great focus! Try mixing in some 15-minute quick sessions for variety.',
          emoji: '💪',
          actionable: false
        });
      } else if (avgSessionLength < 600) { // < 10 minutes
        newSuggestions.push({
          id: '6',
          type: 'strategy',
          title: 'Micro-Learning Expert',
          description: 'Love your bite-sized approach! Try a longer 25-minute focused session when you have time.',
          emoji: '🔬',
          actionable: true
        });
      }
      
      // Timing suggestions
      const hour = new Date().getHours();
      if (hour >= 6 && hour <= 10) {
        newSuggestions.push({
          id: '7',
          type: 'timing',
          title: 'Perfect Morning Energy',
          description: 'Morning brain is sharp! Great time for challenging topics or new concepts.',
          emoji: '🧠',
          actionable: false
        });
      } else if (hour >= 14 && hour <= 16) {
        newSuggestions.push({
          id: '8',
          type: 'timing',
          title: 'Afternoon Focus Window',
          description: 'Post-lunch dip? Try a quick 15-minute review session to re-energize your brain.',
          emoji: '⚡',
          actionable: true
        });
      }
      
      // Fun achievements and milestones
      if (user.totalXp >= 500) {
        newSuggestions.push({
          id: '9',
          type: 'motivation',
          title: 'XP Collector!',
          description: `Amazing! You've earned ${user.totalXp} XP. You're officially a learning machine! 🤖`,
          emoji: '⭐',
          actionable: false
        });
      }
      
      // Streak encouragement
      const highestStreak = Math.max(...subjects.map(s => s.streak), 0);
      if (highestStreak >= 3) {
        newSuggestions.push({
          id: '10',
          type: 'motivation',
          title: 'Streak Champion!',
          description: `${highestStreak} days in a row! Your consistency is building real habits. Keep it rolling! 🔥`,
          emoji: '🔥',
          actionable: false
        });
      }
      
      // Add some fun, random motivational messages
      const randomMotivation = [
        {
          title: 'Brain Gym Time!',
          description: 'Your brain loves variety! Try switching subjects mid-session for a mental cross-training boost.',
          emoji: '🏋️'
        },
        {
          title: 'Learning Ninja Mode',
          description: 'Did you know? Active recall (testing yourself) is 10x more effective than just re-reading!',
          emoji: '🥷'
        },
        {
          title: 'Curiosity Fuel',
          description: 'What would you teach someone else about your subject? Teaching is the ultimate learning test!',
          emoji: '🤔'
        }
      ];
      
      if (Math.random() > 0.7) {
        const random = randomMotivation[Math.floor(Math.random() * randomMotivation.length)];
        newSuggestions.push({
          id: '11',
          type: 'strategy',
          title: random.title,
          description: random.description,
          emoji: random.emoji,
          actionable: false
        });
      }
      
      setSuggestions(newSuggestions.slice(0, 6)); // Limit to 6 suggestions
      setLoading(false);
    }, 1000); // Add a small delay for effect
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'motivation': return '#f093fb';
      case 'strategy': return '#43e97b';
      case 'subject': return '#667eea';
      case 'timing': return '#ffd93d';
      default: return '#667eea';
    }
  };
  
  const displaySuggestions = showAll ? suggestions : suggestions.slice(0, 3);
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      margin: '16px 0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>
          🤖 AI Study Coach
        </h2>
        <button
          onClick={generateSuggestions}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '🔄 Thinking...' : '✨ New Ideas'}
        </button>
      </div>
      
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🧠</div>
          <p>Analyzing your learning patterns...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px' }}>
            {displaySuggestions.map(suggestion => (
              <div
                key={suggestion.id}
                style={{
                  background: `linear-gradient(135deg, ${getTypeColor(suggestion.type)}15, ${getTypeColor(suggestion.type)}08)`,
                  border: `2px solid ${getTypeColor(suggestion.type)}30`,
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'transform 0.2s ease',
                  cursor: suggestion.actionable ? 'pointer' : 'default'
                }}
                onMouseEnter={(e) => {
                  if (suggestion.actionable) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    marginRight: '12px',
                    marginTop: '2px'
                  }}>
                    {suggestion.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      color: '#333',
                      fontSize: '1.1rem'
                    }}>
                      {suggestion.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: '#666',
                      fontSize: '0.95rem',
                      lineHeight: '1.4'
                    }}>
                      {suggestion.description}
                    </p>
                    {suggestion.actionable && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '0.85rem',
                        color: getTypeColor(suggestion.type),
                        fontWeight: '500'
                      }}>
                        💡 Click to act on this suggestion
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {suggestions.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#666'
                }}
              >
                {showAll ? 'Show Less' : `Show ${suggestions.length - 3} More`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudySuggestions;