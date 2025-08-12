import { useState, useEffect, useRef } from 'react';
import { useAnimations } from '../hooks/useAnimations';
import { LevelingSystem /* , type UserLevel, type StudyBoost */ } from '../services/levelingSystem';
import { AchievementEngine } from '../services/achievementSystem';
import { AchievementsPanel } from './AchievementsPanel';
import type { SubjectData, Session } from '../types';

interface UserProfileProps {
  subjects: Record<string, SubjectData>;
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onXPUpdate?: (newXP: number) => void;
}

export function UserProfile({ subjects, sessions, isOpen, onClose, onShowToast, onXPUpdate }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'boosts' | 'prestige'>('profile');
  const [showAchievements, setShowAchievements] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const levelingSystem = LevelingSystem.getInstance();
  const achievementEngine = AchievementEngine.getInstance();
  const { fadeIn, levelUp, pulse /* , progressFill */ } = useAnimations();

  // Calculate total XP from subjects
  const totalXP = Object.values(subjects).reduce((sum, subject) => sum + (subject.totalXP || 0), 0) + 
                  achievementEngine.getTotalAchievementXP();

  const userLevel = levelingSystem.getUserLevel(totalXP);
  const levelStats = levelingSystem.getLevelStats(userLevel);
  const activeBoosts = levelingSystem.getActiveBoosts();
  const availableBoosts = levelingSystem.getAvailableBoosts(totalXP);
  const unlockedAchievements = achievementEngine.getUnlockedAchievements();
  const progressToMilestone = levelingSystem.getProgressToNextMilestone(userLevel.level);

  // Animation effects
  useEffect(() => {
    if (isOpen && profileRef.current) {
      fadeIn(profileRef.current, { duration: 300 });
    }
  }, [isOpen, fadeIn]);

  // Level up animation effect
  useEffect(() => {
    const levelElement = profileRef.current?.querySelector('.level-display');
    if (levelElement && userLevel.level > 1) {
      levelUp(levelElement as HTMLElement, userLevel.level, { duration: 800 });
    }
  }, [userLevel.level, levelUp]);

  const handleBoostPurchase = (boostId: string) => {
    const result = levelingSystem.activateBoost(boostId, totalXP);
    if (result.success && result.newXP !== undefined) {
      onXPUpdate?.(result.newXP);
      onShowToast(`${result.boost?.name} activated! ${result.boost?.description}`, 'success');
      
      // Trigger boost activation animation
      const boostElement = document.querySelector(`[data-boost-id="${boostId}"]`);
      if (boostElement) {
        pulse(boostElement as HTMLElement, { duration: 500 });
      }
    } else {
      onShowToast('Cannot activate boost - insufficient XP or on cooldown', 'error');
    }
  };

  const formatTimeRemaining = (activatedAt: string, duration: number): string => {
    const startTime = new Date(activatedAt).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    const remaining = Math.max(0, (duration * 60 * 1000) - elapsed);
    
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="profile-overlay">
        <div ref={profileRef} className="profile-panel">
          <div className="profile-header">
            <div className="header-content">
              <div className="user-avatar">
                <span className="avatar-icon" style={{ color: userLevel.color }}>
                  {userLevel.icon}
                </span>
                <div className="level-badge">
                  <span className="level-number">{userLevel.level}</span>
                </div>
              </div>
              <div className="user-info">
                <h2 className="user-title">{userLevel.title}</h2>
                <p className="user-description">{userLevel.description}</p>
                <div className="user-stats-quick">
                  <div className="stat-item">
                    <span className="stat-value">{userLevel.totalXP.toLocaleString()}</span>
                    <span className="stat-label">Total XP</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{unlockedAchievements.length}</span>
                    <span className="stat-label">Achievements</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{sessions.length}</span>
                    <span className="stat-label">Sessions</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="close-button" onClick={onClose}>
              <span className="close-icon">✕</span>
            </button>
          </div>

          {/* Level Progress Bar */}
          <div className="level-progress-section">
            <div className="progress-header">
              <span className="progress-label">
                Level {userLevel.level} → {userLevel.level + 1}
              </span>
              <span className="progress-xp">
                {userLevel.currentXP.toLocaleString()} / {userLevel.xpForNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${levelStats.progressPercentage}%`,
                    background: `linear-gradient(90deg, ${userLevel.color}, ${userLevel.color}dd)`
                  }}
                />
              </div>
              <div className="progress-percentage">
                {levelStats.progressPercentage}%
              </div>
            </div>
            {levelStats.nextRewards.length > 0 && (
              <div className="next-rewards">
                <span className="rewards-label">Next unlock:</span>
                <div className="rewards-list">
                  {levelStats.nextRewards.map((reward, index) => (
                    <span key={index} className="reward-item">
                      {reward.icon} {reward.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            {[
              { key: 'profile', label: 'Profile', icon: '👤' },
              { key: 'achievements', label: 'Achievements', icon: '🏆' },
              { key: 'boosts', label: 'Boosts', icon: '⚡' },
              { key: 'prestige', label: 'Prestige', icon: '♦️' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                className={`tab-button ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key as any)}
              >
                <span className="tab-icon">{icon}</span>
                <span className="tab-label">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'profile' && (
              <div className="profile-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {Math.floor(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)}h {sessions.reduce((sum, s) => sum + s.duration, 0) % 60}m
                      </div>
                      <div className="stat-label">Total Study Time</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {Math.max(...Object.values(subjects).map(s => s.currentStreak), 0)} days
                      </div>
                      <div className="stat-label">Current Streak</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                      <div className="stat-value">{Object.keys(subjects).length}</div>
                      <div className="stat-label">Subjects Studied</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length) : 0}m
                      </div>
                      <div className="stat-label">Avg Session</div>
                    </div>
                  </div>
                </div>

                <div className="milestone-progress">
                  <h3 className="section-title">🎯 Next Milestone</h3>
                  <div className="milestone-card">
                    <div className="milestone-info">
                      <div className="milestone-target">Level {progressToMilestone.nextMilestone}</div>
                      <div className="milestone-rewards">
                        {levelingSystem.getLevelRewards(progressToMilestone.nextMilestone).map((reward, i) => (
                          <span key={i} className="milestone-reward">
                            {reward.icon} {reward.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="milestone-progress-bar">
                      <div 
                        className="milestone-progress-fill"
                        style={{ width: `${progressToMilestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="recent-achievements">
                  <h3 className="section-title">🏆 Recent Achievements</h3>
                  <div className="achievements-preview">
                    {unlockedAchievements.slice(-3).map(achievement => (
                      <div key={achievement.id} className="achievement-preview">
                        <div className="achievement-icon">{achievement.icon}</div>
                        <div className="achievement-info">
                          <div className="achievement-name">{achievement.title}</div>
                          <div className="achievement-xp">+{achievement.xpReward} XP</div>
                        </div>
                      </div>
                    ))}
                    <button 
                      className="view-all-achievements"
                      onClick={() => setShowAchievements(true)}
                    >
                      View All →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="achievements-content">
                <div className="achievements-summary">
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <div className="summary-value">{unlockedAchievements.length}</div>
                      <div className="summary-label">Unlocked</div>
                    </div>
                    <div className="summary-stat">
                      <div className="summary-value">{achievementEngine.getTotalAchievementXP()}</div>
                      <div className="summary-label">Bonus XP</div>
                    </div>
                    <div className="summary-stat">
                      <div className="summary-value">
                        {Math.round((unlockedAchievements.length / 25) * 100)}%
                      </div>
                      <div className="summary-label">Complete</div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAchievements(true)}
                  >
                    🏆 View All Achievements
                  </button>
                </div>

                <div className="rarity-breakdown">
                  {Object.entries(achievementEngine.getRarityStats()).map(([rarity, count]) => (
                    <div key={rarity} className={`rarity-stat ${rarity}`}>
                      <div className="rarity-count">{count}</div>
                      <div className="rarity-name">{rarity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'boosts' && (
              <div className="boosts-content">
                {activeBoosts.length > 0 && (
                  <div className="active-boosts">
                    <h3 className="section-title">⚡ Active Boosts</h3>
                    <div className="active-boosts-list">
                      {activeBoosts.map(boost => (
                        <div key={boost.id} className="active-boost">
                          <div className="boost-icon">{boost.icon}</div>
                          <div className="boost-info">
                            <div className="boost-name">{boost.name}</div>
                            <div className="boost-effect">{boost.multiplier}x multiplier</div>
                          </div>
                          <div className="boost-timer">
                            {boost.activatedAt && formatTimeRemaining(boost.activatedAt, boost.duration)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="available-boosts">
                  <h3 className="section-title">🛒 Available Boosts</h3>
                  <div className="boosts-grid">
                    {availableBoosts.map(boost => (
                      <div 
                        key={boost.id} 
                        className={`boost-card ${!boost.canAfford ? 'disabled' : ''} ${boost.onCooldown ? 'cooldown' : ''}`}
                        data-boost-id={boost.id}
                      >
                        <div className="boost-header">
                          <div className="boost-icon-large">{boost.icon}</div>
                          <div className="boost-cost">{boost.cost} XP</div>
                        </div>
                        <div className="boost-details">
                          <h4 className="boost-title">{boost.name}</h4>
                          <p className="boost-description">{boost.description}</p>
                          <div className="boost-stats">
                            <span>Duration: {boost.duration}m</span>
                            <span>Cooldown: {boost.cooldown}m</span>
                          </div>
                        </div>
                        <button 
                          className="boost-purchase-btn"
                          disabled={!boost.canAfford || boost.onCooldown}
                          onClick={() => handleBoostPurchase(boost.id)}
                        >
                          {boost.onCooldown ? 'Active' : 
                           boost.canAfford ? 'Activate' : 'Need More XP'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prestige' && (
              <div className="prestige-content">
                <div className="prestige-info">
                  <div className="prestige-icon">♦️</div>
                  <h3 className="prestige-title">Prestige System</h3>
                  <p className="prestige-description">
                    Reset your level to gain permanent bonuses and exclusive rewards!
                  </p>
                  
                  {levelingSystem.canPrestige(userLevel.level) ? (
                    <div className="prestige-available">
                      <div className="prestige-benefits">
                        <div className="benefit-item">
                          <span className="benefit-icon">💎</span>
                          <span className="benefit-text">Permanent 10% XP boost</span>
                        </div>
                        <div className="benefit-item">
                          <span className="benefit-icon">⭐</span>
                          <span className="benefit-text">Exclusive prestige badge</span>
                        </div>
                        <div className="benefit-item">
                          <span className="benefit-icon">🌟</span>
                          <span className="benefit-text">Special title and colors</span>
                        </div>
                      </div>
                      <button className="prestige-btn">
                        ♦️ Prestige Now
                      </button>
                    </div>
                  ) : (
                    <div className="prestige-locked">
                      <div className="prestige-requirement">
                        Reach level {50} to unlock Prestige
                      </div>
                      <div className="prestige-progress">
                        Progress: {userLevel.level} / {50}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAchievements && (
        <AchievementsPanel
          subjects={subjects}
          sessions={sessions}
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      <style>{`
        .profile-overlay {
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

        .profile-panel {
          background: var(--color-white);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--color-gray-200);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
        }

        .header-content {
          display: flex;
          gap: var(--spacing-lg);
          align-items: center;
        }

        .user-avatar {
          position: relative;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .avatar-icon {
          font-size: 2.5rem;
        }

        .level-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: var(--color-yellow-500);
          color: var(--color-gray-900);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          border: 2px solid white;
        }

        .user-info {
          flex: 1;
        }

        .user-title {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .user-description {
          margin: 0 0 var(--spacing-md) 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .user-stats-quick {
          display: flex;
          gap: var(--spacing-lg);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.8;
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

        .level-progress-section {
          padding: var(--spacing-lg);
          background: var(--color-gray-50);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .progress-label {
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .progress-xp {
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .progress-bar {
          flex: 1;
          height: 12px;
          background: var(--color-gray-200);
          border-radius: var(--border-radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: var(--border-radius-full);
          transition: width 0.5s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .progress-percentage {
          font-weight: 600;
          color: var(--color-gray-700);
          min-width: 40px;
          text-align: right;
        }

        .next-rewards {
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-gray-300);
        }

        .rewards-label {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin-right: var(--spacing-sm);
        }

        .rewards-list {
          display: inline-flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .reward-item {
          background: var(--color-blue-100);
          color: var(--color-blue-700);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .tab-navigation {
          display: flex;
          background: var(--color-gray-100);
          border-radius: 0;
        }

        .tab-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-md);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--color-gray-600);
        }

        .tab-button:hover {
          background: var(--color-gray-200);
          color: var(--color-gray-900);
        }

        .tab-button.active {
          background: var(--color-white);
          color: var(--color-blue-600);
          box-shadow: inset 0 -2px 0 var(--color-blue-600);
        }

        .tab-icon {
          font-size: 1.25rem;
        }

        .tab-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tab-content {
          padding: var(--spacing-lg);
        }

        .profile-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .stat-info .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-gray-900);
          margin-bottom: var(--spacing-xs);
        }

        .stat-info .stat-label {
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .section-title {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .milestone-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
        }

        .milestone-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .milestone-target {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .milestone-rewards {
          display: flex;
          gap: var(--spacing-sm);
        }

        .milestone-reward {
          background: var(--color-purple-100);
          color: var(--color-purple-700);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
        }

        .milestone-progress-bar {
          height: 8px;
          background: var(--color-gray-200);
          border-radius: var(--border-radius-full);
          overflow: hidden;
        }

        .milestone-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a855f7);
          border-radius: var(--border-radius-full);
          transition: width 0.5s ease;
        }

        .achievements-preview {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .achievement-preview {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-md);
        }

        .achievement-preview .achievement-icon {
          font-size: 1.5rem;
        }

        .achievement-info {
          flex: 1;
        }

        .achievement-name {
          font-weight: 600;
          color: var(--color-gray-900);
          margin-bottom: var(--spacing-xs);
        }

        .achievement-xp {
          font-size: 0.875rem;
          color: var(--color-blue-600);
          font-weight: 500;
        }

        .view-all-achievements {
          align-self: flex-start;
          background: var(--color-blue-600);
          color: white;
          border: none;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--border-radius);
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .view-all-achievements:hover {
          background: var(--color-blue-700);
        }

        .achievements-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .summary-stats {
          display: flex;
          gap: var(--spacing-xl);
        }

        .summary-stat {
          text-align: center;
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-blue-600);
          margin-bottom: var(--spacing-xs);
        }

        .summary-label {
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .rarity-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-md);
        }

        .rarity-stat {
          text-align: center;
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-lg);
          border: 2px solid;
        }

        .rarity-stat.common {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border-color: #10b981;
        }

        .rarity-stat.rare {
          background: linear-gradient(135deg, #dbeafe, #93c5fd);
          border-color: #3b82f6;
        }

        .rarity-stat.epic {
          background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
          border-color: #8b5cf6;
        }

        .rarity-stat.legendary {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-color: #f59e0b;
        }

        .rarity-count {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
        }

        .rarity-name {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .boosts-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .active-boosts-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .active-boost {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-md);
        }

        .boost-icon {
          font-size: 1.5rem;
        }

        .boost-info {
          flex: 1;
        }

        .boost-name {
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }

        .boost-effect {
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .boost-timer {
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--color-orange-700);
        }

        .boosts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-lg);
        }

        .boost-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          transition: all 0.3s ease;
        }

        .boost-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .boost-card.disabled {
          opacity: 0.6;
        }

        .boost-card.cooldown {
          background: var(--color-orange-50);
          border-color: var(--color-orange-200);
        }

        .boost-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .boost-icon-large {
          font-size: 2rem;
        }

        .boost-cost {
          background: var(--color-blue-600);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .boost-title {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .boost-description {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--color-gray-600);
          line-height: 1.5;
        }

        .boost-stats {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          font-size: 0.875rem;
          color: var(--color-gray-500);
        }

        .boost-purchase-btn {
          width: 100%;
          background: var(--color-green-600);
          color: white;
          border: none;
          padding: var(--spacing-sm);
          border-radius: var(--border-radius);
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .boost-purchase-btn:hover:not(:disabled) {
          background: var(--color-green-700);
        }

        .boost-purchase-btn:disabled {
          background: var(--color-gray-400);
          cursor: not-allowed;
        }

        .prestige-content {
          display: flex;
          justify-content: center;
          padding: var(--spacing-xl);
        }

        .prestige-info {
          text-align: center;
          max-width: 400px;
        }

        .prestige-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
        }

        .prestige-title {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-gray-900);
        }

        .prestige-description {
          margin: 0 0 var(--spacing-xl) 0;
          color: var(--color-gray-600);
          line-height: 1.6;
        }

        .prestige-benefits {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--color-purple-50);
          border-radius: var(--border-radius);
        }

        .benefit-icon {
          font-size: 1.5rem;
        }

        .benefit-text {
          font-weight: 500;
          color: var(--color-gray-900);
        }

        .prestige-btn {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: white;
          border: none;
          padding: var(--spacing-md) var(--spacing-xl);
          border-radius: var(--border-radius-lg);
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .prestige-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
        }

        .prestige-locked {
          background: var(--color-gray-100);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-xl);
        }

        .prestige-requirement {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-700);
          margin-bottom: var(--spacing-md);
        }

        .prestige-progress {
          color: var(--color-gray-600);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .profile-overlay {
            padding: 0;
          }
          
          .profile-panel {
            max-height: 100vh;
            border-radius: 0;
          }
          
          .profile-header {
            border-radius: 0;
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .boosts-grid {
            grid-template-columns: 1fr;
          }
          
          .rarity-breakdown {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .tab-button {
            padding: var(--spacing-sm);
          }
          
          .tab-icon {
            font-size: 1rem;
          }
          
          .tab-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}