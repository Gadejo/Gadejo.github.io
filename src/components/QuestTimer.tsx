import { useState, useEffect, useRef } from 'react';
import type { SubjectData, Session } from '../types';

interface QuestTimerProps {
  isOpen: boolean;
  subjectData: SubjectData | null;
  onClose: () => void;
  onComplete: (session: Omit<Session, 'id'>) => void;
}

interface TimerState {
  questType: string | null;
  startTime: number | null;
  pausedAt: number | null;
  pausedMs: number;
}

export function QuestTimer({ isOpen, subjectData, onClose, onComplete }: QuestTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    questType: null,
    startTime: null,
    pausedAt: null,
    pausedMs: 0
  });
  const [displayTime, setDisplayTime] = useState('00:00');
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setTimerState({
        questType: null,
        startTime: null,
        pausedAt: null,
        pausedMs: 0
      });
      setDisplayTime('00:00');
      setNotes('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (timerState.startTime && !timerState.pausedAt) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - timerState.startTime! - timerState.pausedMs;
        updateDisplayTime(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.startTime, timerState.pausedAt, timerState.pausedMs]);

  const updateDisplayTime = (elapsed: number) => {
    const minutes = Math.max(0, Math.floor(elapsed / 60000));
    const seconds = Math.max(0, Math.floor((elapsed % 60000) / 1000));
    setDisplayTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const startQuest = (questTypeId: string) => {
    setTimerState({
      questType: questTypeId,
      startTime: Date.now(),
      pausedAt: null,
      pausedMs: 0
    });
  };

  const togglePause = () => {
    if (!timerState.startTime) return;

    if (timerState.pausedAt) {
      // Resume
      setTimerState(prev => ({
        ...prev,
        pausedMs: prev.pausedMs + (Date.now() - prev.pausedAt!),
        pausedAt: null
      }));
    } else {
      // Pause
      setTimerState(prev => ({
        ...prev,
        pausedAt: Date.now()
      }));
    }
  };

  const completeSession = () => {
    if (!timerState.startTime || !timerState.questType || !subjectData) return;

    const endTime = Date.now();
    const totalElapsed = endTime - timerState.startTime - timerState.pausedMs;
    const minutes = Math.max(1, Math.round(totalElapsed / 60000));

    const session: Omit<Session, 'id'> = {
      subjectId: subjectData.config.id,
      duration: minutes,
      date: new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
      questType: timerState.questType
    };

    onComplete(session);
    onClose();
  };

  if (!isOpen || !subjectData) return null;

  const { config } = subjectData;
  const isPaused = timerState.startTime && timerState.pausedAt;

  return (
    <div className="sheet-overlay">
      <div className="sheet open">
        <div className="bar"></div>
        <h3 style={{ textAlign: 'center', margin: '0 0 4px' }}>
          Start a Quest
        </h3>

        {!timerState.startTime ? (
          // Quest selection
          <div className="quest-choices">
            {config.questTypes.map(quest => (
              <button
                key={quest.id}
                className="btn"
                onClick={() => startQuest(quest.id)}
                title={`${quest.duration} minutes`}
              >
                {quest.emoji} {quest.name} ({quest.duration}m)
              </button>
            ))}
          </div>
        ) : (
          // Timer display
          <>
            <div className="timer">{displayTime}</div>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="note"
              placeholder="Notes… What did you practice?"
            />

            <div className="timer-controls">
              <button className="btn" onClick={togglePause}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button className="btn" onClick={completeSession}>
                ⏹️ Complete Session
              </button>
              <button className="btn" onClick={onClose}>
                ❌ Cancel
              </button>
            </div>
          </>
        )}

        <div className="active-label" style={{ textAlign: 'center', marginTop: '6px', color: 'var(--muted)' }}>
          {config.emoji} {config.name}
        </div>
      </div>
    </div>
  );
}