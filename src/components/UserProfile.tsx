import { useState, useEffect, useRef } from 'react';
import { useAnimations } from '../hooks/useAnimations';
import { Card, CardBody, CardHeader, PrimaryButton, Badge } from './ui';
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
      <div className="modal-overlay" onClick={onClose}>
        <div ref={profileRef} className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white border-opacity-30">
                    <span className="text-4xl" style={{ color: userLevel.color }}>
                      {userLevel.icon}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold border-2 border-white">
                    {userLevel.level}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{userLevel.title}</h2>
                  <p className="text-white text-opacity-90 text-sm mb-3">{userLevel.description}</p>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-xl font-bold">{userLevel.totalXP.toLocaleString()}</div>
                      <div className="text-xs text-white text-opacity-80">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{unlockedAchievements.length}</div>
                      <div className="text-xs text-white text-opacity-80">Achievements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{sessions.length}</div>
                      <div className="text-xs text-white text-opacity-80">Sessions</div>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm bg-white bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
          </CardHeader>

          {/* Level Progress Bar */}
          <div className="bg-gray-50 border-b p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">
                Level {userLevel.level} → {userLevel.level + 1}
              </span>
              <span className="text-sm text-gray-600">
                {userLevel.currentXP.toLocaleString()} / {userLevel.xpForNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${levelStats.progressPercentage}%`,
                    background: `linear-gradient(90deg, ${userLevel.color}, ${userLevel.color}dd)`
                  }}
                />
              </div>
              <div className="text-sm font-semibold text-gray-700 min-w-12 text-right">
                {levelStats.progressPercentage}%
              </div>
            </div>
            {levelStats.nextRewards.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <span className="text-sm text-gray-600 mr-2">Next unlock:</span>
                <div className="inline-flex flex-wrap gap-2">
                  {levelStats.nextRewards.map((reward, index) => (
                    <Badge key={index} variant="primary" className="text-xs">
                      {reward.icon} {reward.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100">
            {[
              { key: 'profile', label: 'Profile', icon: '👤' },
              { key: 'achievements', label: 'Achievements', icon: '🏆' },
              { key: 'boosts', label: 'Boosts', icon: '⚡' },
              { key: 'prestige', label: 'Prestige', icon: '♦️' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                className={`flex-1 flex flex-col items-center gap-1 p-3 text-sm font-medium transition-colors ${
                  activeTab === key 
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(key as any)}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <CardBody className="max-h-96 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardBody className="flex items-center gap-4">
                      <div className="text-3xl opacity-80">⏰</div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          {Math.floor(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)}h {sessions.reduce((sum, s) => sum + s.duration, 0) % 60}m
                        </div>
                        <div className="text-sm text-gray-600">Total Study Time</div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="flex items-center gap-4">
                      <div className="text-3xl opacity-80">🔥</div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          {Math.max(...Object.values(subjects).map(s => s.currentStreak), 0)} days
                        </div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="flex items-center gap-4">
                      <div className="text-3xl opacity-80">📚</div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          {Object.keys(subjects).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Subjects</div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2">Achievements</h3>
                <p className="text-gray-600 mb-4">View all your unlocked achievements and progress.</p>
                <PrimaryButton onClick={() => setShowAchievements(true)}>
                  View All Achievements
                </PrimaryButton>
              </div>
            )}

            {activeTab === 'boosts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Study Boosts</h3>
                {activeBoosts.length > 0 ? (
                  <div className="space-y-3">
                    {activeBoosts.map((boost, index) => (
                      <Card key={index} className="border-orange-200 bg-orange-50">
                        <CardBody className="flex items-center gap-4">
                          <div className="text-2xl">⚡</div>
                          <div className="flex-1">
                            <div className="font-semibold">{boost.name}</div>
                            <div className="text-sm text-gray-600">{boost.description}</div>
                          </div>
                          <div className="text-orange-700 font-mono font-semibold">
                            {boost.activatedAt && formatTimeRemaining(boost.activatedAt, boost.duration)}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No active boosts</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {availableBoosts.slice(0, 4).map((boost) => (
                    <Card key={boost.id} className="hover-lift">
                      <CardBody>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl">{boost.icon}</div>
                          <Badge variant="primary">{boost.cost} XP</Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{boost.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{boost.description}</p>
                        <div className="text-xs text-gray-500 mb-3">
                          Duration: {boost.duration}min • Cooldown: {boost.cooldown}h
                        </div>
                        <PrimaryButton
                          size="sm"
                          onClick={() => handleBoostPurchase(boost.id)}
                          disabled={totalXP < boost.cost}
                          data-boost-id={boost.id}
                        >
                          Activate
                        </PrimaryButton>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prestige' && (
              <div className="text-center py-8">
                <div className="text-6xl mb-6">♦️</div>
                <h3 className="text-xl font-bold mb-3">Prestige System</h3>
                <p className="text-gray-600 mb-6">Reset your progress to unlock exclusive rewards and multipliers.</p>
                {userLevel.level >= 50 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 justify-center">
                        <span className="text-2xl">⚡</span>
                        <span className="font-medium">2x XP Multiplier</span>
                      </div>
                      <div className="flex items-center gap-3 justify-center">
                        <span className="text-2xl">🎨</span>
                        <span className="font-medium">Exclusive Themes</span>
                      </div>
                      <div className="flex items-center gap-3 justify-center">
                        <span className="text-2xl">👑</span>
                        <span className="font-medium">Prestige Badge</span>
                      </div>
                    </div>
                    <PrimaryButton size="lg">
                      Prestige Now
                    </PrimaryButton>
                  </div>
                ) : (
                  <Card className="bg-gray-100">
                    <CardBody>
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Reach Level 50 to Unlock Prestige
                      </div>
                      <div className="text-gray-600">
                        Current: Level {userLevel.level} • Remaining: {50 - userLevel.level} levels
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </CardBody>
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
    </>
  );
}