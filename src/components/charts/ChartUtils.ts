/**
 * Chart Utilities for Analytics Dashboard
 * Provides data processing and chart helper functions
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  emoji?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  category?: string;
}

export interface StudyMetrics {
  totalMinutes: number;
  sessionCount: number;
  averageSession: number;
  longestStreak: number;
  currentStreak: number;
  xpEarned: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDuration(minutes: number): string {
  if (minutes === 0) return '0 minutes';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  let result = `${hours} hour${hours !== 1 ? 's' : ''}`;
  if (remainingMins > 0) {
    result += ` ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
  }
  
  return result;
}

export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

export function groupSessionsByDate(sessions: any[], days: number = 7): Record<string, number> {
  const dateRange = getDateRange(days);
  const grouped: Record<string, number> = {};
  
  // Initialize all dates with 0
  dateRange.forEach(date => {
    grouped[date] = 0;
  });
  
  // Sum sessions by date
  sessions.forEach(session => {
    if (grouped.hasOwnProperty(session.date)) {
      grouped[session.date] += session.duration;
    }
  });
  
  return grouped;
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function getWeeklyComparison(sessions: any[]): {
  thisWeek: number;
  lastWeek: number;
  growth: number;
} {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const thisWeek = sessions
    .filter(s => new Date(s.date) >= oneWeekAgo)
    .reduce((sum, s) => sum + s.duration, 0);
    
  const lastWeek = sessions
    .filter(s => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < oneWeekAgo)
    .reduce((sum, s) => sum + s.duration, 0);
    
  return {
    thisWeek,
    lastWeek,
    growth: calculateGrowthRate(thisWeek, lastWeek)
  };
}

export function getStudyDistribution(sessions: any[], subjects: Record<string, any>): ChartDataPoint[] {
  const distribution: Record<string, number> = {};
  
  sessions.forEach(session => {
    distribution[session.subjectId] = (distribution[session.subjectId] || 0) + session.duration;
  });
  
  return Object.entries(distribution).map(([subjectId, minutes]) => ({
    label: subjects[subjectId]?.config.name || 'Unknown',
    value: minutes,
    color: subjects[subjectId]?.config.color || '#6366f1',
    emoji: subjects[subjectId]?.config.emoji || '📚'
  }));
}

export function getProductivityScore(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const recentSessions = sessions.slice(-10); // Last 10 sessions
  const avgDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
  const consistency = Math.min(100, recentSessions.length * 10); // Max 100 for 10+ sessions
  
  // Combine average duration and consistency for productivity score
  const durationScore = Math.min(100, avgDuration * 2); // Max 100 for 50+ min sessions
  
  return Math.round((durationScore + consistency) / 2);
}

export function getBestStudyTime(sessions: any[]): string {
  const hourCounts: Record<number, number> = {};
  
  sessions.forEach(_session => {
    // For now, we'll use a random hour since we don't have time data
    // In a real app, you'd parse the session timestamp
    const hour = Math.floor(Math.random() * 24);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const bestHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
    
  if (!bestHour) return 'No data';
  
  const hour = parseInt(bestHour);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  
  return `${displayHour}:00 ${ampm}`;
}

export function getStreakData(subjects: Record<string, any>): ChartDataPoint[] {
  return Object.values(subjects).map((subject: any) => ({
    label: subject.config.name,
    value: subject.currentStreak,
    color: subject.config.color,
    emoji: subject.config.emoji
  }));
}

export function generateInsights(sessions: any[], subjects: Record<string, any>): string[] {
  const insights: string[] = [];
  
  if (sessions.length === 0) {
    return ['Start your learning journey to see personalized insights!'];
  }
  
  const weeklyComparison = getWeeklyComparison(sessions);
  const distribution = getStudyDistribution(sessions, subjects);
  const topSubject = distribution.sort((a, b) => b.value - a.value)[0];
  const productivity = getProductivityScore(sessions);
  
  // Growth insights
  if (weeklyComparison.growth > 0) {
    insights.push(`📈 Great progress! You studied ${weeklyComparison.growth}% more this week than last week.`);
  } else if (weeklyComparison.growth < -20) {
    insights.push(`💪 Your study time decreased this week. Try to get back on track!`);
  }
  
  // Subject focus insights
  if (topSubject) {
    insights.push(`🎯 ${topSubject.emoji} ${topSubject.label} is your most studied subject with ${formatTime(topSubject.value)}.`);
  }
  
  // Productivity insights
  if (productivity > 80) {
    insights.push(`🔥 Excellent productivity! You're maintaining consistent study sessions.`);
  } else if (productivity < 40) {
    insights.push(`⏰ Try longer study sessions for better learning retention.`);
  }
  
  // Streak insights
  const streaks = getStreakData(subjects);
  const bestStreak = streaks.sort((a, b) => b.value - a.value)[0];
  if (bestStreak && bestStreak.value > 0) {
    insights.push(`🔥 ${bestStreak.emoji} Your ${bestStreak.label} streak is ${bestStreak.value} days strong!`);
  }
  
  return insights;
}