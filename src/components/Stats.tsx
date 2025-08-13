import type { SubjectData, Session } from '../types';
import { Card, CardBody, CardHeader } from './ui';

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
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-600">Start learning and tracking your progress to see detailed statistics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Minutes Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">This Week — Minutes by Subject</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {Object.values(subjects).map(subject => {
                const minutes = weeklyMinutes[subject.config.id] || 0;
                const percentage = (minutes / maxWeeklyMinutes) * 100;
                
                return (
                  <div key={subject.config.id} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-900">
                      <span className="mr-2">{subject.config.emoji}</span>
                      {subject.config.name}
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: subject.config.color
                        }}
                      />
                    </div>
                    <div className="w-16 text-sm font-bold text-gray-600 text-right">{minutes}m</div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Streaks Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Current Streaks</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {Object.values(subjects).map(subject => {
                const streaks = getStudyStreak(subject.config.id);
                const percentage = Math.min(100, streaks.current * 5); // Cap at 100% for display
                
                return (
                  <div key={subject.config.id} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-900">
                      <span className="mr-2">{subject.config.emoji}</span>
                      {subject.config.name}
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: subject.config.color
                        }}
                      />
                    </div>
                    <div className="w-16 text-sm font-bold text-gray-600 text-right">
                      {streaks.current} day{streaks.current !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
                })}
            </div>
          </CardBody>
        </Card>

        {/* All-Time Totals */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">All-Time Totals</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {Object.values(subjects).map(subject => {
                const minutes = totalTimes[subject.config.id] || 0;
                const percentage = (minutes / maxTotalMinutes) * 100;
                
                return (
                  <div key={subject.config.id} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-900">
                      <span className="mr-2">{subject.config.emoji}</span>
                      {subject.config.name}
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: subject.config.color
                        }}
                      />
                    </div>
                    <div className="w-16 text-sm font-bold text-gray-600 text-right">{formatTime(minutes)}</div>
                  </div>
                );
                })}
            </div>
          </CardBody>
        </Card>

        {/* Session Summary */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Session Summary</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {Object.values(subjects).map(subject => {
                const sessionCount = sessionCounts[subject.config.id] || 0;
                const avgLength = avgSessionLengths[subject.config.id] || 0;
                const streaks = getStudyStreak(subject.config.id);
                
                return (
                  <div key={subject.config.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{subject.config.emoji}</span>
                      <span className="font-semibold text-sm text-gray-900">{subject.config.name}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center">
                        <span className="block text-xs text-gray-500 mb-1">Sessions</span>
                        <span className="block text-sm font-bold text-gray-900">{sessionCount}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs text-gray-500 mb-1">Avg Length</span>
                        <span className="block text-sm font-bold text-gray-900">{avgLength}m</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs text-gray-500 mb-1">Best Streak</span>
                        <span className="block text-sm font-bold text-gray-900">{streaks.longest} days</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs text-gray-500 mb-1">XP</span>
                        <span className="block text-sm font-bold text-gray-900">{subject.totalXP}</span>
                      </div>
                    </div>
                  </div>
                );
                })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}