import React, { useState } from 'react';
import type { SubjectData } from '../types';

interface SubjectCardProps {
  subjectData: SubjectData;
  todayMinutes: number;
  pipCount: number;
  onStartQuest: () => void;
  onQuickAdd: (minutes: number) => void;
  onManualAdd: (minutes: number, questType: string, notes: string) => void;
  onPipClick: () => void;
  animationDelay?: number;
}

export function SubjectCard({
  subjectData,
  todayMinutes,
  pipCount,
  onStartQuest,
  onQuickAdd,
  onManualAdd,
  onPipClick,
  animationDelay = 0
}: SubjectCardProps) {
  const [showManual, setShowManual] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualQuestType, setManualQuestType] = useState(subjectData.config.questTypes[0]?.id || '');
  const [manualNotes, setManualNotes] = useState('');

  const { config } = subjectData;
  const progressPercent = Math.min(100, Math.round((subjectData.totalMinutes / (config.targetHours * 60)) * 100));
  const currentAchievement = config.achievements[subjectData.achievementLevel];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(manualMinutes, 10);
    if (minutes > 0) {
      onManualAdd(minutes, manualQuestType, manualNotes);
      setManualMinutes('');
      setManualNotes('');
      setShowManual(false);
    }
  };

  return (
    <article 
      className="card" 
      style={{ 
        '--accent': config.color,
        animationDelay: `${animationDelay}ms`
      } as React.CSSProperties}>
      <div className="header">
        <div className="subject-title">
          <span style={{ fontSize: '18px' }}>{config.emoji}</span>
          <span>{config.name}</span>
        </div>
        <small style={{ color: 'var(--muted)', fontWeight: 800 }}>
          Small steps &gt; zero days
        </small>
      </div>

      {/* Daily Pips */}
      <div className="pips">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="pip"
                        aria-checked={i < pipCount}
            onClick={pipCount < 3 ? onPipClick : undefined}
            style={{ cursor: pipCount < 3 ? 'pointer' : 'default' }}
          />
        ))}
        <span className="hint">Tap a pip = +{config.pipAmount}m</span>
      </div>

      {/* Stats */}
      <div className="statline">
        <div className="stat">
          <span className="label">Current Streak</span>
          <span className="value">{subjectData.currentStreak} 🔥</span>
        </div>
        <div className="stat">
          <span className="label">Today</span>
          <span className="value">{todayMinutes} min ⏱️</span>
        </div>
        <div className="stat">
          <span className="label">Achievement</span>
          <span className="value">{currentAchievement?.name || 'None'}</span>
        </div>
        <div className="stat">
          <span className="label">Total</span>
          <span className="value">
            {Math.floor(subjectData.totalMinutes / 60)}h {subjectData.totalMinutes % 60}m
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className="progress"
      >
        <i 
          className="bar" 
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: config.color
          }} 
        />
      </div>

      {/* Action Buttons */}
      <div className="btnrow">
        <button 
          className="btn btn-primary" 
          onClick={onStartQuest}
          style={{ backgroundColor: config.color }}
        >
          ▶️ Start Quest
        </button>
        <button className="btn quick" onClick={() => onQuickAdd(15)}>+15m</button>
        <button className="btn quick" onClick={() => onQuickAdd(30)}>+30m</button>
        <button className="btn quick" onClick={() => onQuickAdd(45)}>+45m</button>
        <button className="btn quick" onClick={() => onQuickAdd(60)}>+60m</button>

        {/* Manual Add */}
        <details 
          style={{ flexBasis: '100%' }}
          open={showManual}
          onToggle={(e) => setShowManual((e.target as HTMLDetailsElement).open)}
        >
          <summary>✍️ Manual add</summary>
          <form className="manual" onSubmit={handleManualSubmit}>
            <input
              type="number"
              min="1"
              placeholder="Minutes"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              required
            />
            <select 
              value={manualQuestType}
              onChange={(e) => setManualQuestType(e.target.value)}
            >
              {config.questTypes.map(quest => (
                <option key={quest.id} value={quest.id}>
                  {quest.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              style={{ gridColumn: '1 / -1' }}
            />
            <button className="btn" type="submit">Add</button>
          </form>
        </details>
      </div>
    </article>
  );
}