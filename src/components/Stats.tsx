import type { SubjectData, Session } from '../types';

interface StatsProps {
  subjects: Record<string, SubjectData>;
  sessions: Session[];
}

export function Stats({ subjects, sessions }: StatsProps) {
  const calculateWeeklyMinutes = (): Record<string, number> => {
    const result: Record<string, number> = {};
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Initialize all subjects with 0
    Object.keys(subjects).forEach(subjectId => {
      result[subjectId] = 0;
    });

    // Sum up minutes from the last 7 days
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= oneWeekAgo && result.hasOwnProperty(session.subjectId)) {
        result[session.subjectId] += session.duration;
      }
    });

    return result;
  };

  const calculateTotalTime = (): Record<string, number> => {
    const result: Record<string, number> = {};
    
    Object.values(subjects).forEach(subject => {
      result[subject.config.id] = subject.totalMinutes;
    });

    return result;
  };

  const calculateSessionCounts = (): Record<string, number> => {
    const result: Record<string, number> = {};
    
    // Initialize all subjects with 0
    Object.keys(subjects).forEach(subjectId => {
      result[subjectId] = 0;
    });

    // Count sessions for each subject
    sessions.forEach(session => {
      if (result.hasOwnProperty(session.subjectId)) {
        result[session.subjectId]++;
      }
    });

    return result;
  };

  const calculateAverageSessionLength = (): Record<string, number> => {
    const sessionCounts = calculateSessionCounts();
    const totalTimes = calculateTotalTime();
    const result: Record<string, number> = {};

    Object.keys(subjects).forEach(subjectId => {
      const count = sessionCounts[subjectId];
      const total = totalTimes[subjectId];
      result[subjectId] = count > 0 ? Math.round(total / count) : 0;
    });

    return result;
  };

  const getStudyStreak = (subjectId: string): { current: number; longest: number } => {
    const subject = subjects[subjectId];
    if (!subject) return { current: 0, longest: 0 };
    
    return {
      current: subject.currentStreak,
      longest: subject.longestStreak
    };
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const weeklyMinutes = calculateWeeklyMinutes();
  const totalTimes = calculateTotalTime();
  const sessionCounts = calculateSessionCounts();
  const avgSessionLengths = calculateAverageSessionLength();

  const maxWeeklyMinutes = Math.max(...Object.values(weeklyMinutes), 1);
  const maxTotalMinutes = Math.max(...Object.values(totalTimes), 1);

  if (Object.keys(subjects).length === 0) {
    return (
      <div className="stats-view">
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3>No Data Yet</h3>
          <p>Start learning and tracking your progress to see detailed statistics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-view">
      <div className="stats-grid">
        {/* Weekly Minutes Chart */}
        <div className="stat-card">
          <h3>This Week — Minutes by Subject</h3>
          <div className="chart-bars">
            {Object.values(subjects).map(subject => {
              const minutes = weeklyMinutes[subject.config.id] || 0;
              const percentage = (minutes / maxWeeklyMinutes) * 100;
              
              return (
                <div key={subject.config.id} className="chart-bar">
                  <div className="bar-label">
                    <strong>{subject.config.emoji}</strong> {subject.config.name}
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: subject.config.color
                      }}
                    />
                  </div>
                  <div className="bar-value">{minutes}m</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streaks Chart */}
        <div className="stat-card">
          <h3>Current Streaks</h3>
          <div className="chart-bars">
            {Object.values(subjects).map(subject => {
              const streaks = getStudyStreak(subject.config.id);
              const percentage = Math.min(100, streaks.current * 5); // Cap at 100% for display
              
              return (
                <div key={subject.config.id} className="chart-bar">
                  <div className="bar-label">
                    <strong>{subject.config.emoji}</strong> {subject.config.name}
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: subject.config.color
                      }}
                    />
                  </div>
                  <div className="bar-value">
                    {streaks.current} day{streaks.current !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All-Time Totals */}
        <div className="stat-card">
          <h3>All-Time Totals</h3>
          <div className="chart-bars">
            {Object.values(subjects).map(subject => {
              const minutes = totalTimes[subject.config.id] || 0;
              const percentage = (minutes / maxTotalMinutes) * 100;
              
              return (
                <div key={subject.config.id} className="chart-bar">
                  <div className="bar-label">
                    <strong>{subject.config.emoji}</strong> {subject.config.name}
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: subject.config.color
                      }}
                    />
                  </div>
                  <div className="bar-value">{formatTime(minutes)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Summary */}
        <div className="stat-card">
          <h3>Session Summary</h3>
          <div className="summary-list">
            {Object.values(subjects).map(subject => {
              const sessionCount = sessionCounts[subject.config.id] || 0;
              const avgLength = avgSessionLengths[subject.config.id] || 0;
              const streaks = getStudyStreak(subject.config.id);
              
              return (
                <div key={subject.config.id} className="summary-item">
                  <div className="summary-header">
                    <span className="summary-emoji">{subject.config.emoji}</span>
                    <span className="summary-name">{subject.config.name}</span>
                  </div>
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <span className="stat-label">Sessions</span>
                      <span className="stat-value">{sessionCount}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Avg Length</span>
                      <span className="stat-value">{avgLength}m</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Best Streak</span>
                      <span className="stat-value">{streaks.longest} days</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">XP</span>
                      <span className="stat-value">{subject.totalXP}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .stats-view {
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }

        @media (min-width: 900px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .stat-card {
          background: var(--surface);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 20px;
        }

        .stat-card h3 {
          margin: 0 0 16px 0;
          color: var(--text);
          font-size: 16px;
        }

        .chart-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chart-bar {
          display: grid;
          grid-template-columns: 120px 1fr 60px;
          gap: 12px;
          align-items: center;
        }

        .bar-label {
          font-size: 13px;
          font-weight: 700;
        }

        .bar-value {
          font-size: 12px;
          font-weight: 700;
          text-align: right;
          color: var(--muted);
        }

        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .summary-item {
          padding: 12px;
          background: #f3f5f9;
          border-radius: 10px;
        }

        [data-theme="dark"] .summary-item {
          background: #17202f;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .summary-emoji {
          font-size: 16px;
        }

        .summary-name {
          font-weight: 700;
          font-size: 14px;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 12px;
        }

        .summary-stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 2px;
        }

        .stat-value {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        }

        .empty-state {
          text-align: center;
          color: var(--muted);
          padding: 80px 20px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: var(--text);
        }

        @media (max-width: 600px) {
          .chart-bar {
            grid-template-columns: 1fr;
            gap: 6px;
            text-align: center;
          }

          .bar-value {
            text-align: center;
          }

          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}