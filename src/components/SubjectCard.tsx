import React, { useState } from 'react';
import { Card, CardBody, CardFooter, Button, PrimaryButton, SecondaryButton } from './ui';
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
    <Card 
      className="subject-card-wrapper"
      style={{ 
        animationDelay: `${animationDelay}ms`
      } as React.CSSProperties}
      data-subject-id={config.id}
    >
      <CardBody>
        <div className="flex items-center justify-between mb-3">
          <div className="subject-title">
            <span className="text-lg mr-2">{config.emoji}</span>
            <span className="font-semibold">{config.name}</span>
          </div>
          <small className="text-xs text-gray-500 font-medium">
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
        <div className="progress">
          <div 
            className="bar" 
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: config.color
            }} 
          />
        </div>
      </CardBody>

      <CardFooter>
        {/* Action Buttons */}
        <div className="btnrow">
          <PrimaryButton 
            onClick={onStartQuest}
            style={{ backgroundColor: config.color }}
            className="flex-1"
          >
            ▶️ Start Quest
          </PrimaryButton>
          <SecondaryButton 
            size="sm" 
            onClick={() => onQuickAdd(15)}
            className="btn quick"
          >
            +15m
          </SecondaryButton>
          <SecondaryButton 
            size="sm" 
            onClick={() => onQuickAdd(30)}
            className="btn quick"
          >
            +30m
          </SecondaryButton>
          <SecondaryButton 
            size="sm" 
            onClick={() => onQuickAdd(45)}
            className="btn quick"
          >
            +45m
          </SecondaryButton>
          <SecondaryButton 
            size="sm" 
            onClick={() => onQuickAdd(60)}
            className="btn quick"
          >
            +60m
          </SecondaryButton>
        </div>

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
              className="form-input"
              id={`manual-minutes-${config.id}`}
              name="manualMinutes"
              min="1"
              placeholder="Minutes"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              required
            />
            <select 
              className="form-input"
              id={`manual-quest-type-${config.id}`}
              name="manualQuestType"
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
              className="form-input"
              id={`manual-notes-${config.id}`}
              name="manualNotes"
              placeholder="Notes (optional)"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              style={{ gridColumn: '1 / -1' }}
            />
            <Button variant="primary" type="submit">Add</Button>
          </form>
        </details>
      </CardFooter>
    </Card>
  );
}