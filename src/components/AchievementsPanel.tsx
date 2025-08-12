import { useState, useEffect, useRef } from 'react';
import { useAnimations } from '../hooks/useAnimations';
import { AchievementEngine, ACHIEVEMENTS, /* BADGES, */ type /* Achievement, */ /* Badge, */ UserStats } from '../services/achievementSystem';
import type { SubjectData, Session } from '../types';

interface AchievementsPanelProps {
  subjects: Record<string, SubjectData>;
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsPanel({ subjects, sessions, isOpen, onClose }: AchievementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'unlocked' | 'progress' | 'badges'>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const achievementEngine = AchievementEngine.getInstance();
  const { fadeIn, staggeredEntrance /* , achievementUnlock, bounce */ } = useAnimations();

  // Calculate user stats for achievement checking
  const calculateUserStats = (): UserStats => {
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalSessions = sessions.length;
    const subjectsStudied = Object.keys(subjects).length;
    const longestStreak = Math.max(...Object.values(subjects).map(s => s.longestStreak), 0);
    const currentStreak = Math.max(...Object.values(subjects).map(s => s.currentStreak), 0);
    const totalXP = Object.values(subjects).reduce((sum, s) => sum + (s.totalXP || 0), 0);

    // Weekly minutes (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyMinutes = sessions
      .filter(session => new Date(session.date) >= oneWeekAgo)
      .reduce((sum, session) => sum + session.duration, 0);

    // Monthly minutes (last 30 days)
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const monthlyMinutes = sessions
      .filter(session => new Date(session.date) >= oneMonthAgo)
      .reduce((sum, session) => sum + session.duration, 0);

    const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    const studyDays = new Set(sessions.map(s => s.date)).size;

    // Calculate perfect weeks (simplified)
    const perfectWeeks = Math.floor(currentStreak / 7);

    // Subject mastery (simplified)
    const subjectMastery: Record<string, number> = {};
    Object.entries(subjects).forEach(([id, subject]) => {
      subjectMastery[id] = Math.floor((subject.totalMinutes || 0) / 60); // Hours as mastery level
    });

    // Time preference (simplified - would need actual time data)
    const timeOfDayPreference = 'morning'; // Placeholder

    // Sessions by day (simplified)
    const sessionsByDay = sessions.reduce((acc, session) => {
      const dayOfWeek = new Date(session.date).toLocaleDateString('en', { weekday: 'long' });
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMinutes,
      totalSessions,
      subjectsStudied,
      longestStreak,
      currentStreak,
      totalXP,
      weeklyMinutes,
      monthlyMinutes,
      averageSessionLength,
      studyDays,
      perfectWeeks,
      subjectMastery,
      timeOfDayPreference,
      sessionsByDay
    };
  };

  const userStats = calculateUserStats();
  const unlockedAchievements = achievementEngine.getUnlockedAchievements();
  const unlockedBadges = achievementEngine.getUnlockedBadges();
  const rarityStats = achievementEngine.getRarityStats();

  // Filter achievements based on selected filters
  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
    
    if (selectedCategory === 'unlocked' && !isUnlocked) return false;
    if (selectedCategory === 'progress' && isUnlocked) return false;
    if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) return false;
    
    return true;
  });

  // Animation effects
  useEffect(() => {
    if (isOpen && panelRef.current) {
      fadeIn(panelRef.current, { duration: 300 });
      
      // Stagger achievement cards
      const cards = panelRef.current.querySelectorAll('.achievement-card');
      if (cards.length > 0) {
        staggeredEntrance(Array.from(cards) as HTMLElement[], 'slideUp', 50);
      }
    }
  }, [isOpen, selectedCategory, selectedRarity, fadeIn, staggeredEntrance]);

  // Check for new achievements periodically
  useEffect(() => {
    const newAchievements = achievementEngine.checkAchievements(userStats);
    newAchievements.forEach(achievement => {
      // Show achievement unlock animation
      console.log(`🎉 Achievement Unlocked: ${achievement.title}`);
    });
  }, [userStats.totalMinutes, userStats.totalSessions, userStats.longestStreak]);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRarityGlow = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '0 0 20px rgba(16, 185, 129, 0.3)';
      case 'rare': return '0 0 20px rgba(59, 130, 246, 0.3)';
      case 'epic': return '0 0 20px rgba(139, 92, 246, 0.3)';
      case 'legendary': return '0 0 30px rgba(245, 158, 11, 0.5)';
      default: return 'none';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="achievements-overlay">
      <div ref={panelRef} className="achievements-panel">
        <div className="achievements-header">
          <div className="header-content">
            <h2 className="panel-title">🏆 Achievements</h2>
            <p className="panel-subtitle">
              {unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            <span className="close-icon">✕</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{unlockedAchievements.length}</div>
            <div className="stat-label">Achievements</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{unlockedBadges.length}</div>
            <div className="stat-label">Badges</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{achievementEngine.getTotalAchievementXP()}</div>
            <div className="stat-label">Bonus XP</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%</div>
            <div className="stat-label">Complete</div>
          </div>
        </div>

        {/* Rarity Distribution */}
        <div className="rarity-distribution">
          <div className="rarity-item">
            <div className="rarity-dot common"></div>
            <span className="rarity-count">{rarityStats.common}</span>
            <span className="rarity-label">Common</span>
          </div>
          <div className="rarity-item">
            <div className="rarity-dot rare"></div>
            <span className="rarity-count">{rarityStats.rare}</span>
            <span className="rarity-label">Rare</span>
          </div>
          <div className="rarity-item">
            <div className="rarity-dot epic"></div>
            <span className="rarity-count">{rarityStats.epic}</span>
            <span className="rarity-label">Epic</span>
          </div>
          <div className="rarity-item">
            <div className="rarity-dot legendary"></div>
            <span className="rarity-count">{rarityStats.legendary}</span>
            <span className="rarity-label">Legendary</span>
          </div>
        </div>

        {/* Filters */}
        <div className="achievement-filters">
          <div className="filter-group">
            <label className="filter-label">Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Achievements</option>
              <option value="unlocked">Unlocked</option>
              <option value="progress">In Progress</option>
              <option value="badges">Badges</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Rarity:</label>
            <select 
              value={selectedRarity} 
              onChange={(e) => setSelectedRarity(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Achievement Grid */}
        {selectedCategory === 'badges' ? (
          <div className="badges-grid">
            {unlockedBadges.map((badge) => (
              <div 
                key={badge.id} 
                className="badge-card"
                style={{ 
                  borderColor: badge.color,
                  boxShadow: `0 0 15px ${badge.color}33`
                }}
              >
                <div className="badge-icon" style={{ fontSize: '2.5rem' }}>
                  {badge.icon}
                </div>
                <div className="badge-info">
                  <h4 className="badge-name">{badge.name}</h4>
                  <p className="badge-description">{badge.description}</p>
                </div>
                <div className="badge-glow" style={{ background: badge.color }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="achievements-grid">
            {filteredAchievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
              const progress = achievementEngine.getAchievementProgress(achievement, userStats);
              const rarityColor = getRarityColor(achievement.rarity);
              
              return (
                <div 
                  key={achievement.id}
                  className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${achievement.rarity}`}
                  style={{
                    borderColor: isUnlocked ? rarityColor : '#e5e7eb',
                    boxShadow: isUnlocked ? getRarityGlow(achievement.rarity) : 'none'
                  }}
                >
                  <div className="achievement-header">
                    <div className="achievement-icon">
                      {isUnlocked ? achievement.icon : '🔒'}
                    </div>
                    <div className="achievement-rarity" style={{ color: rarityColor }}>
                      {achievement.rarity.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="achievement-content">
                    <h3 className="achievement-title">
                      {isUnlocked || !achievement.isSecret ? achievement.title : '???'}
                    </h3>
                    <p className="achievement-description">
                      {isUnlocked || !achievement.isSecret ? achievement.description : 'Hidden achievement'}
                    </p>
                    
                    {!isUnlocked && (
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${progress.percentage}%`,
                              background: rarityColor 
                            }}
                          />
                        </div>
                        <div className="progress-text">
                          {progress.current} / {progress.target}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="achievement-footer">
                    <div className="achievement-xp">
                      +{achievement.xpReward} XP
                    </div>
                    {isUnlocked && achievement.unlockedAt && (
                      <div className="unlock-date">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {isUnlocked && achievement.rarity === 'legendary' && (
                    <div className="legendary-effect"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .achievements-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-md);
        }

        .achievements-panel {
          background: var(--color-white);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 1200px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--color-gray-200);
        }

        .achievements-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-gray-200);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
        }

        .panel-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .panel-subtitle {
          margin: var(--spacing-xs) 0 0 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .close-icon {
          font-size: 1.25rem;
          font-weight: bold;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--color-gray-50);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .stat-card {
          text-align: center;
          padding: var(--spacing-md);
          background: var(--color-white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-blue-600);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--color-gray-600);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rarity-distribution {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--color-gray-50);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .rarity-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
        }

        .rarity-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .rarity-dot.common { background: #10b981; }
        .rarity-dot.rare { background: #3b82f6; }
        .rarity-dot.epic { background: #8b5cf6; }
        .rarity-dot.legendary { background: #f59e0b; }

        .rarity-count {
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .rarity-label {
          color: var(--color-gray-600);
        }

        .achievement-filters {
          display: flex;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          background: var(--color-white);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-gray-700);
        }

        .filter-select {
          padding: var(--spacing-sm);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--border-radius);
          background: var(--color-white);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
        }

        .achievement-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }

        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .achievement-card.unlocked {
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        }

        .achievement-card.locked {
          opacity: 0.7;
        }

        .achievement-card.legendary {
          position: relative;
        }

        .legendary-effect {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.1) 50%, transparent 70%);
          animation: legendaryShine 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes legendaryShine {
          0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .achievement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .achievement-icon {
          font-size: 2.5rem;
          text-align: center;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-50);
          border-radius: 50%;
          border: 2px solid var(--color-gray-200);
        }

        .achievement-card.unlocked .achievement-icon {
          background: linear-gradient(135deg, #fef3c7, #fbbf24);
          border-color: #f59e0b;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .achievement-rarity {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--color-gray-100);
          border-radius: var(--border-radius);
        }

        .achievement-title {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .achievement-description {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 0.875rem;
          color: var(--color-gray-600);
          line-height: 1.5;
        }

        .achievement-progress {
          margin-bottom: var(--spacing-md);
        }

        .progress-bar {
          height: 6px;
          background: var(--color-gray-200);
          border-radius: var(--border-radius);
          overflow: hidden;
          margin-bottom: var(--spacing-xs);
        }

        .progress-fill {
          height: 100%;
          border-radius: var(--border-radius);
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.75rem;
          color: var(--color-gray-500);
          text-align: center;
        }

        .achievement-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-gray-100);
        }

        .achievement-xp {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-blue-600);
          background: var(--color-blue-50);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
        }

        .unlock-date {
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        /* Badges Grid */
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
        }

        .badge-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background: var(--color-white);
          border: 2px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .badge-card:hover {
          transform: scale(1.05);
        }

        .badge-icon {
          flex-shrink: 0;
        }

        .badge-info {
          flex: 1;
        }

        .badge-name {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .badge-description {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .badge-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0.8;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .achievements-overlay {
            padding: 0;
          }
          
          .achievements-panel {
            max-height: 100vh;
            border-radius: 0;
          }
          
          .achievements-header {
            border-radius: 0;
          }
          
          .achievements-grid {
            grid-template-columns: 1fr;
            padding: var(--spacing-md);
          }
          
          .badges-grid {
            grid-template-columns: 1fr;
            padding: var(--spacing-md);
          }
          
          .achievement-filters {
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .rarity-distribution {
            flex-wrap: wrap;
            gap: var(--spacing-md);
          }
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .achievements-panel {
            background: var(--color-gray-800);
            border-color: var(--color-gray-700);
          }
          
          .achievement-card {
            background: var(--color-gray-800);
            border-color: var(--color-gray-600);
          }
          
          .achievement-card.unlocked {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          }
          
          .badge-card {
            background: var(--color-gray-800);
            border-color: var(--color-gray-600);
          }
          
          .achievement-title,
          .badge-name {
            color: var(--color-gray-100);
          }
          
          .achievement-description,
          .badge-description {
            color: var(--color-gray-300);
          }
        }
      `}</style>
    </div>
  );
}