import { useState, useEffect, useRef } from 'react';
import { useAnimations } from '../hooks/useAnimations';
import { Card, CardBody, CardHeader, CardFooter, SecondaryButton, Badge } from './ui';
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
    <div className="modal-overlay" onClick={onClose}>
      <div ref={panelRef} className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xl font-semibold">🏆 Achievements</h2>
              <p className="text-sm text-white text-opacity-90 mt-1">
                {unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked
              </p>
            </div>
            <SecondaryButton size="sm" onClick={onClose} className="bg-white bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30">✕</SecondaryButton>
          </div>
        </CardHeader>

        {/* Stats Overview */}
        <div className="bg-gray-50 border-b p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardBody className="text-center">
                <div className="text-xl font-bold text-blue-600">{unlockedAchievements.length}</div>
                <div className="text-xs text-gray-600">Achievements</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-xl font-bold text-blue-600">{unlockedBadges.length}</div>
                <div className="text-xs text-gray-600">Badges</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-xl font-bold text-blue-600">{achievementEngine.getTotalAchievementXP()}</div>
                <div className="text-xs text-gray-600">Bonus XP</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-xl font-bold text-blue-600">{Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%</div>
                <div className="text-xs text-gray-600">Complete</div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Rarity Distribution */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium text-gray-900">{rarityStats.common}</span>
              <span className="text-sm text-gray-600">Common</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium text-gray-900">{rarityStats.rare}</span>
              <span className="text-sm text-gray-600">Rare</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="font-medium text-gray-900">{rarityStats.epic}</span>
              <span className="text-sm text-gray-600">Epic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="font-medium text-gray-900">{rarityStats.legendary}</span>
              <span className="text-sm text-gray-600">Legendary</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b p-6">
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="form-input flex-1 min-w-32"
              >
                <option value="all">All Achievements</option>
                <option value="unlocked">Unlocked</option>
                <option value="progress">In Progress</option>
                <option value="badges">Badges</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Rarity:</label>
              <select 
                value={selectedRarity} 
                onChange={(e) => setSelectedRarity(e.target.value as any)}
                className="form-input flex-1 min-w-32"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>
        </div>

        <CardBody className="max-h-96 overflow-y-auto">
          {/* Achievement Grid */}
          {selectedCategory === 'badges' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedBadges.map((badge) => (
                <Card 
                  key={badge.id} 
                  className="hover-lift"
                  style={{ 
                    borderColor: badge.color,
                    boxShadow: `0 0 15px ${badge.color}33`
                  }}
                >
                  <CardBody className="flex items-center gap-4">
                    <div className="text-4xl flex-shrink-0">
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => {
                const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
                const progress = achievementEngine.getAchievementProgress(achievement, userStats);
                const rarityColor = getRarityColor(achievement.rarity);
                
                return (
                  <Card 
                    key={achievement.id}
                    className={`hover-lift ${!isUnlocked ? 'opacity-70' : ''}`}
                    style={{
                      borderColor: isUnlocked ? rarityColor : '#e5e7eb',
                      boxShadow: isUnlocked ? getRarityGlow(achievement.rarity) : 'none'
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between w-full">
                        <div className="text-4xl w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-gray-200" style={{
                          background: isUnlocked ? 'linear-gradient(135deg, #fef3c7, #fbbf24)' : '',
                          borderColor: isUnlocked ? '#f59e0b' : '',
                          boxShadow: isUnlocked ? '0 4px 12px rgba(245, 158, 11, 0.3)' : ''
                        }}>
                          {isUnlocked ? achievement.icon : '🔒'}
                        </div>
                        <Badge variant="primary" size="sm" style={{ color: rarityColor }}>
                          {achievement.rarity.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardBody>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {isUnlocked || !achievement.isSecret ? achievement.title : '???'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {isUnlocked || !achievement.isSecret ? achievement.description : 'Hidden achievement'}
                      </p>
                      
                      {!isUnlocked && (
                        <div className="mb-4">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${progress.percentage}%`,
                                background: rarityColor 
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {progress.current} / {progress.target}
                          </div>
                        </div>
                      )}
                    </CardBody>
                    
                    <CardFooter className="flex justify-between items-center">
                      <Badge variant="primary" size="sm">
                        +{achievement.xpReward} XP
                      </Badge>
                      {isUnlocked && achievement.unlockedAt && (
                        <div className="text-xs text-gray-500">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardBody>
      </div>
    </div>
  );
}