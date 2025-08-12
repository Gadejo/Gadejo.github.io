import { useState, useEffect, useRef } from 'react';
import { LineChart } from './charts/LineChart';
import { DonutChart } from './charts/DonutChart';
import { MetricCard } from './charts/MetricCard';
import { useAnimations } from '../hooks/useAnimations';
import {
  formatTime,
  // formatDuration,
  getDateRange,
  // groupSessionsByDate,
  getWeeklyComparison,
  getStudyDistribution,
  getProductivityScore,
  getBestStudyTime,
  // getStreakData,
  generateInsights,
  // type ChartDataPoint,
  type TimeSeriesPoint
} from './charts/ChartUtils';
import type { SubjectData, Session } from '../types';

interface EnhancedStatsProps {
  subjects: Record<string, SubjectData>;
  sessions: Session[];
}

export function EnhancedStats({ subjects, sessions }: EnhancedStatsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(7);
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'insights'>('overview');
  const containerRef = useRef<HTMLDivElement>(null);
  const { staggeredEntrance } = useAnimations();

  // Apply entrance animations
  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.metric-card, .chart-card');
      if (cards.length > 0) {
        staggeredEntrance(Array.from(cards) as HTMLElement[], 'slideUp', 100);
      }
    }
  }, [selectedView, staggeredEntrance]);

  // Calculate metrics
  const weeklyComparison = getWeeklyComparison(sessions);
  const studyDistribution = getStudyDistribution(sessions, subjects);
  const productivity = getProductivityScore(sessions);
  const bestStudyTime = getBestStudyTime(sessions);
  const insights = generateInsights(sessions, subjects);
  
  // Time series data for the selected period
  const timeSeriesData: TimeSeriesPoint[] = getDateRange(selectedPeriod).map(date => ({
    date,
    value: sessions
      .filter(session => session.date === date)
      .reduce((sum, session) => sum + session.duration, 0)
  }));

  // Calculate totals
  const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
  const totalSessions = sessions.length;
  const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  
  // Current streak calculation
  const maxStreak = Math.max(...Object.values(subjects).map(s => s.currentStreak), 0);
  const totalXP = Object.values(subjects).reduce((sum, s) => sum + (s.totalXP || 0), 0);

  // Period selector
  const PeriodSelector = () => (
    <div className="period-selector">
      {[7, 14, 30].map(days => (
        <button
          key={days}
          className={`period-button ${selectedPeriod === days ? 'active' : ''}`}
          onClick={() => setSelectedPeriod(days as 7 | 14 | 30)}
        >
          {days}d
        </button>
      ))}
    </div>
  );

  // View selector
  const ViewSelector = () => (
    <div className="view-selector">
      {[
        { key: 'overview', label: 'Overview', icon: '📊' },
        { key: 'trends', label: 'Trends', icon: '📈' },
        { key: 'insights', label: 'Insights', icon: '💡' }
      ].map(({ key, label, icon }) => (
        <button
          key={key}
          className={`view-button ${selectedView === key ? 'active' : ''}`}
          onClick={() => setSelectedView(key as any)}
        >
          <span className="view-icon">{icon}</span>
          <span className="view-label">{label}</span>
        </button>
      ))}
    </div>
  );

  if (Object.keys(subjects).length === 0) {
    return (
      <div className="enhanced-stats-container">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No Data Yet</h3>
          <p className="empty-state-description">
            Start learning and tracking your progress to see detailed analytics and insights!
          </p>
        </div>
      </div>
    );
  }

  const OverviewView = () => (
    <div className="analytics-grid">
      {/* Key Metrics */}
      <div className="metrics-row">
        <MetricCard
          title="Total Study Time"
          value={formatTime(totalMinutes)}
          subtitle={`${totalSessions} sessions completed`}
          icon="⏰"
          trend={{
            value: weeklyComparison.growth,
            label: 'vs last week',
            isPositive: weeklyComparison.growth >= 0
          }}
          color="#3b82f6"
        />
        
        <MetricCard
          title="Current Streak"
          value={`${maxStreak}`}
          subtitle="days in a row"
          icon="🔥"
          color="#ef4444"
        />
        
        <MetricCard
          title="Average Session"
          value={`${averageSession}m`}
          subtitle="per study session"
          icon="📖"
          color="#10b981"
        />
        
        <MetricCard
          title="Total XP"
          value={totalXP}
          subtitle="experience points"
          icon="⭐"
          color="#f59e0b"
        />
      </div>

      {/* Study Distribution Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">📚 Study Distribution</h3>
          <p className="chart-subtitle">Time spent by subject</p>
        </div>
        <div className="chart-content">
          {studyDistribution.length > 0 ? (
            <DonutChart
              data={studyDistribution}
              size={280}
              innerRadius={70}
              centerContent={
                <div>
                  <div className="center-total">{formatTime(totalMinutes)}</div>
                  <div className="center-label">Total</div>
                </div>
              }
            />
          ) : (
            <div className="chart-empty">No data available</div>
          )}
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="insight-cards">
        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <div className="insight-title">Productivity Score</div>
            <div className="insight-value">{productivity}%</div>
            <div className="insight-description">
              {productivity > 80 ? 'Excellent!' : productivity > 60 ? 'Good progress' : 'Room for improvement'}
            </div>
          </div>
        </div>
        
        <div className="insight-card">
          <div className="insight-icon">🕐</div>
          <div className="insight-content">
            <div className="insight-title">Best Study Time</div>
            <div className="insight-value">{bestStudyTime}</div>
            <div className="insight-description">Your most productive hour</div>
          </div>
        </div>
      </div>
    </div>
  );

  const TrendsView = () => (
    <div className="trends-container">
      <div className="trends-header">
        <h3 className="trends-title">📈 Study Trends</h3>
        <PeriodSelector />
      </div>
      
      <div className="chart-card large">
        <div className="chart-header">
          <h4 className="chart-title">Daily Study Minutes</h4>
          <p className="chart-subtitle">Last {selectedPeriod} days</p>
        </div>
        <div className="chart-content">
          <LineChart
            data={timeSeriesData}
            width={800}
            height={300}
            color="#3b82f6"
            fillColor="rgba(59, 130, 246, 0.1)"
          />
        </div>
      </div>

      <div className="trends-grid">
        <MetricCard
          title={`${selectedPeriod}-Day Total`}
          value={formatTime(timeSeriesData.reduce((sum, d) => sum + d.value, 0))}
          subtitle="total study time"
          icon="📊"
          color="#8b5cf6"
        />
        
        <MetricCard
          title="Daily Average"
          value={formatTime(Math.round(timeSeriesData.reduce((sum, d) => sum + d.value, 0) / selectedPeriod))}
          subtitle="per day average"
          icon="📈"
          color="#06b6d4"
        />
      </div>
    </div>
  );

  const InsightsView = () => (
    <div className="insights-container">
      <div className="insights-header">
        <h3 className="insights-title">💡 Personalized Insights</h3>
        <p className="insights-subtitle">Based on your learning patterns</p>
      </div>
      
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="insight-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="insight-content">
              <p className="insight-text">{insight}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional detailed stats */}
      <div className="detailed-stats-grid">
        {Object.values(subjects).map(subject => {
          const subjectSessions = sessions.filter(s => s.subjectId === subject.config.id);
          const subjectMinutes = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
          
          return (
            <div key={subject.config.id} className="subject-detail-card">
              <div className="subject-detail-header">
                <span className="subject-emoji">{subject.config.emoji}</span>
                <div className="subject-info">
                  <h4 className="subject-name">{subject.config.name}</h4>
                  <p className="subject-time">{formatTime(subjectMinutes)}</p>
                </div>
              </div>
              <div className="subject-stats">
                <div className="stat-item">
                  <span className="stat-label">Sessions</span>
                  <span className="stat-value">{subjectSessions.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Streak</span>
                  <span className="stat-value">{subject.currentStreak}d</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">XP</span>
                  <span className="stat-value">{subject.totalXP || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="enhanced-stats-container">
      <div className="stats-header">
        <div className="header-content">
          <h2 className="page-title">📊 Analytics Dashboard</h2>
          <p className="page-subtitle">Track your learning progress and insights</p>
        </div>
        <ViewSelector />
      </div>
      
      <div className="stats-content">
        {selectedView === 'overview' && <OverviewView />}
        {selectedView === 'trends' && <TrendsView />}
        {selectedView === 'insights' && <InsightsView />}
      </div>

      <style>{`
        .enhanced-stats-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-md);
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
          gap: var(--spacing-lg);
        }

        .header-content h2 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-gray-900);
        }

        .page-subtitle {
          margin: 0;
          color: var(--color-gray-600);
        }

        .view-selector {
          display: flex;
          background: var(--color-gray-100);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-xs);
          gap: var(--spacing-xs);
        }

        .view-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--border-radius);
          border: none;
          background: transparent;
          color: var(--color-gray-600);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-button:hover {
          background: var(--color-white);
          color: var(--color-gray-900);
        }

        .view-button.active {
          background: var(--color-white);
          color: var(--color-blue-600);
          box-shadow: var(--shadow-sm);
        }

        .view-icon {
          font-size: 1rem;
        }

        .period-selector {
          display: flex;
          gap: var(--spacing-xs);
          background: var(--color-gray-100);
          border-radius: var(--border-radius);
          padding: var(--spacing-xs);
        }

        .period-button {
          padding: var(--spacing-xs) var(--spacing-sm);
          border: none;
          border-radius: var(--border-radius-sm);
          background: transparent;
          color: var(--color-gray-600);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .period-button:hover {
          background: var(--color-white);
        }

        .period-button.active {
          background: var(--color-white);
          color: var(--color-blue-600);
          box-shadow: var(--shadow-sm);
        }

        /* Analytics Grid */
        .analytics-grid {
          display: grid;
          gap: var(--spacing-lg);
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }

        .chart-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }

        .chart-card.large {
          padding: var(--spacing-xl);
        }

        .chart-header {
          margin-bottom: var(--spacing-lg);
        }

        .chart-title {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .chart-subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .chart-content {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .chart-empty {
          color: var(--color-gray-500);
          text-align: center;
          padding: var(--spacing-xl);
        }

        .center-total {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-gray-900);
        }

        .center-label {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin-top: var(--spacing-xs);
        }

        /* Insight Cards */
        .insight-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .insight-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }

        .insight-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .insight-title {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin-bottom: var(--spacing-xs);
        }

        .insight-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-gray-900);
          margin-bottom: var(--spacing-xs);
        }

        .insight-description {
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        /* Trends */
        .trends-container {
          display: grid;
          gap: var(--spacing-lg);
        }

        .trends-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .trends-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .trends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }

        /* Insights */
        .insights-container {
          display: grid;
          gap: var(--spacing-lg);
        }

        .insights-header {
          text-align: center;
        }

        .insights-title {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .insights-subtitle {
          margin: 0;
          color: var(--color-gray-600);
        }

        .insights-list {
          display: grid;
          gap: var(--spacing-md);
        }

        .insight-item {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          color: white;
          animation: slideIn 0.5s ease-out both;
        }

        .insight-text {
          margin: 0;
          font-size: 1rem;
          line-height: 1.6;
        }

        .detailed-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-md);
        }

        .subject-detail-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }

        .subject-detail-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .subject-emoji {
          font-size: 2rem;
        }

        .subject-name {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .subject-time {
          margin: 0;
          color: var(--color-gray-600);
        }

        .subject-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: var(--color-gray-500);
          margin-bottom: var(--spacing-xs);
        }

        .stat-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
        }

        .empty-state-title {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-gray-900);
        }

        .empty-state-description {
          margin: 0;
          color: var(--color-gray-600);
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }

          .metrics-row {
            grid-template-columns: 1fr;
          }

          .insight-cards {
            grid-template-columns: 1fr;
          }

          .trends-header {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: stretch;
          }

          .detailed-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .page-title {
            color: var(--color-gray-100);
          }
          
          .chart-card,
          .insight-card,
          .subject-detail-card {
            background: var(--color-gray-800);
            border-color: var(--color-gray-700);
          }
          
          .chart-title,
          .insight-value,
          .subject-name,
          .stat-value {
            color: var(--color-gray-100);
          }
        }
      `}</style>
    </div>
  );
}