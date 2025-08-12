import { useState } from 'react';
import type { Goal, SubjectData, Session } from '../types';

interface GoalsProps {
  subjects: Record<string, SubjectData>;
  goals: Goal[];
  sessions: Session[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onRemoveGoal: (goalId: string) => void;
  onStartQuest: (subjectId: string) => void;
  onQuickAdd: (subjectId: string, minutes: number) => void;
  onShowToast: (message: string) => void;
  onShowConfetti: () => void;
}

export function Goals({
  subjects,
  goals,
  sessions,
  onAddGoal,
  onUpdateGoal,
  onRemoveGoal,
  onStartQuest,
  onQuickAdd,
  onShowToast,
  onShowConfetti
}: GoalsProps) {
  const [filters, setFilters] = useState({
    subject: 'all',
    status: 'active'
  });
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    subjectId: Object.keys(subjects)[0] || '',
    type: 'minutes' as 'minutes' | 'sessions',
    target: 1,
    dueDate: '',
    priority: 'M' as 'H' | 'M' | 'L'
  });

  const calculateGoalProgress = (goal: Goal): number => {
    const startDate = new Date(goal.startDate);
    const endDate = goal.dueDate ? new Date(goal.dueDate) : new Date();
    
    const relevantSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return session.subjectId === goal.subjectId &&
             sessionDate >= new Date(startDate.toDateString()) &&
             sessionDate <= new Date(endDate.toDateString());
    });

    if (goal.type === 'minutes') {
      return relevantSessions.reduce((total, session) => total + session.duration, 0);
    } else {
      return relevantSessions.length;
    }
  };

  const filteredGoals = goals.filter(goal => {
    const subjectMatch = filters.subject === 'all' || goal.subjectId === filters.subject;
    const progress = calculateGoalProgress(goal);
    const isCompleted = goal.done || progress >= goal.target;
    const statusMatch = filters.status === 'all' || 
                       (filters.status === 'active' && !isCompleted) ||
                       (filters.status === 'done' && isCompleted);
    
    return subjectMatch && statusMatch;
  });

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.subjectId) return;

    const goal: Omit<Goal, 'id'> = {
      title: newGoal.title.trim(),
      subjectId: newGoal.subjectId,
      type: newGoal.type,
      target: Math.max(1, newGoal.target),
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: newGoal.dueDate || null,
      priority: newGoal.priority,
      done: false
    };

    onAddGoal(goal);
    setNewGoal({
      title: '',
      subjectId: Object.keys(subjects)[0] || '',
      type: 'minutes',
      target: 1,
      dueDate: '',
      priority: 'M'
    });
    
    onShowToast('Goal added! 🎯');
  };

  const handleQuickGoal = (template: { title: string; type: 'minutes' | 'sessions'; target: number; timeframe: 'today' | 'week' }) => {
    if (!Object.keys(subjects).length) return;

    const today = new Date().toISOString().slice(0, 10);
    let dueDate = today;
    
    if (template.timeframe === 'week') {
      const nextWeek = new Date();
      const daysUntilSunday = (7 - nextWeek.getDay()) % 7;
      nextWeek.setDate(nextWeek.getDate() + (daysUntilSunday || 7));
      dueDate = nextWeek.toISOString().slice(0, 10);
    }

    const subject = Object.values(subjects)[0];
    const goal: Omit<Goal, 'id'> = {
      title: `${subject.config.emoji} ${template.title}`,
      subjectId: subject.config.id,
      type: template.type,
      target: template.target,
      startDate: today,
      dueDate,
      priority: 'M',
      done: false
    };

    onAddGoal(goal);
    onShowToast('Quick goal added! 🚀');
  };

  const handleMarkDone = (goalId: string) => {
    onUpdateGoal(goalId, { done: true });
    onShowToast('Goal completed! 🎉');
    onShowConfetti();
  };

  // Auto-complete goals that have reached their target
  filteredGoals.forEach(goal => {
    if (!goal.done && calculateGoalProgress(goal) >= goal.target) {
      onUpdateGoal(goal.id, { done: true });
      onShowToast(`Goal completed: ${goal.title} 🎉`);
      onShowConfetti();
    }
  });

  return (
    <div className="goals-view">
      <div className="goal-add">
        <details open>
          <summary><strong>➕ Add a Goal</strong></summary>
          <form onSubmit={handleSubmitGoal}>
            <div className="goal-form-grid">
              <input
                id="goal-title"
                name="title"
                type="text"
                placeholder="Goal (e.g., 30m vocab)"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              
              <select 
                id="goal-subject"
                name="subject"
                value={newGoal.subjectId}
                onChange={(e) => setNewGoal(prev => ({ ...prev, subjectId: e.target.value }))}
              >
                {Object.values(subjects).map(subject => (
                  <option key={subject.config.id} value={subject.config.id}>
                    {subject.config.emoji} {subject.config.name}
                  </option>
                ))}
              </select>
              
              <select 
                id="goal-type"
                name="type"
                value={newGoal.type}
                onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as 'minutes' | 'sessions' }))}
              >
                <option value="minutes">Minutes</option>
                <option value="sessions">Sessions</option>
              </select>
              
              <input
                id="goal-target"
                name="target"
                type="number"
                min="1"
                step="1"
                placeholder="Target"
                value={newGoal.target}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                required
              />
              
              <input
                id="goal-due"
                name="due"
                type="date"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))}
              />
              
              <select 
                id="goal-priority"
                name="priority"
                value={newGoal.priority}
                onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as 'H' | 'M' | 'L' }))}
              >
                <option value="H">High</option>
                <option value="M">Medium</option>
                <option value="L">Low</option>
              </select>
              
              <button className="btn" type="submit">Add</button>
            </div>
          </form>
          
          <div className="quick-goals">
            <button
              className="btn mini"
              onClick={() => handleQuickGoal({ title: '15m today', type: 'minutes', target: 15, timeframe: 'today' })}
            >
              📆 Today 15m
            </button>
            <button
              className="btn mini"
              onClick={() => handleQuickGoal({ title: '3 sessions this week', type: 'sessions', target: 3, timeframe: 'week' })}
            >
              🗓️ Week · 3 sessions
            </button>
          </div>
        </details>
      </div>

      <div className="goal-list">
        <div className="goal-filters">
          <select
            id="filter-subject"
            name="filterSubject"
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
          >
            <option value="all">All subjects</option>
            {Object.values(subjects).map(subject => (
              <option key={subject.config.id} value={subject.config.id}>
                {subject.config.name}
              </option>
            ))}
          </select>
          
          <select
            id="filter-status"
            name="filterStatus"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="active">Active</option>
            <option value="done">Completed</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="goal-rows">
          {filteredGoals.length === 0 ? (
            <div className="empty-state">
              No goals match your current filters. Create your first goal above!
            </div>
          ) : (
            filteredGoals.map(goal => {
              const subject = subjects[goal.subjectId];
              const progress = calculateGoalProgress(goal);
              const percentage = Math.min(100, Math.round((progress / goal.target) * 100));
              const isCompleted = goal.done || progress >= goal.target;
              const isOverdue = !isCompleted && goal.dueDate && new Date(goal.dueDate) < new Date();

              if (!subject) return null;

              return (
                <div
                  key={goal.id}
                  className={`goal-row ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
                >
                  <div className="goal-content">
                    <div className="goal-title">{goal.title}</div>
                    <div className="goal-meta">
                      <span>{subject.config.emoji} {subject.config.name}</span>
                      <span>• {goal.type} · {progress}/{goal.target}</span>
                      {goal.dueDate && <span>• Due {goal.dueDate}</span>}
                      <span>• {goal.priority === 'H' ? 'High' : goal.priority === 'M' ? 'Medium' : 'Low'} priority</span>
                    </div>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: subject.config.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="goal-actions">
                    <button
                      className="btn mini"
                      onClick={() => onStartQuest(goal.subjectId)}
                      title="Start quest"
                    >
                      ▶️ Start
                    </button>
                    
                    {goal.type === 'minutes' && (
                      <button
                        className="btn mini"
                        onClick={() => onQuickAdd(goal.subjectId, 5)}
                        title="Add 5 minutes"
                      >
                        +5m
                      </button>
                    )}
                    
                    {goal.type === 'sessions' && (
                      <button
                        className="btn mini"
                        onClick={() => onQuickAdd(goal.subjectId, 5)}
                        title="Add 1 session"
                      >
                        +1 session
                      </button>
                    )}
                    
                    {!isCompleted && (
                      <button
                        className="btn mini"
                        onClick={() => handleMarkDone(goal.id)}
                        title="Mark as done"
                      >
                        ✔️ Done
                      </button>
                    )}
                    
                    <button
                      className="btn mini remove"
                      onClick={() => {
                        if (confirm('Remove this goal?')) {
                          onRemoveGoal(goal.id);
                          onShowToast('Goal removed');
                        }
                      }}
                      title="Remove goal"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .goals-view {
          max-width: 800px;
          margin: 0 auto;
        }

        .goal-add {
          background: var(--surface);
          border-radius: var(--r);
          box-shadow: var(--shadow);
          padding: 16px;
          margin-bottom: 16px;
        }

        .goal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 6px;
          align-items: center;
          margin-top: 12px;
        }
        
        .goal-form-grid input[name="due"] {
          grid-column: 1 / 3;
        }
        
        .goal-form-grid select[name="priority"] {
          grid-column: 3 / 4;
        }
        
        .goal-form-grid button {
          grid-column: 4 / 5;
        }

        @media (max-width: 840px) {
          .goal-form-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .goal-form-grid input[name="due"],
          .goal-form-grid select[name="priority"],
          .goal-form-grid button {
            grid-column: unset;
          }
        }

        @media (max-width: 520px) {
          .goal-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .goal-form-grid input,
        .goal-form-grid select {
          height: 36px;
          border-radius: 10px;
          border: 1px solid #cbd3e3;
          padding: 0 8px;
          background: var(--surface);
          color: var(--text);
          font-family: inherit;
        }

        [data-theme="dark"] .goal-form-grid input,
        [data-theme="dark"] .goal-form-grid select {
          border-color: #2b3853;
        }

        .quick-goals {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .goal-list {
          background: var(--surface);
          border-radius: var(--r);
          box-shadow: var(--shadow);
          padding: 16px;
        }

        .goal-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .goal-filters select {
          height: 36px;
          border-radius: 10px;
          border: 1px solid #cbd3e3;
          padding: 0 8px;
          background: var(--surface);
          color: var(--text);
          font-family: inherit;
        }

        .goal-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          padding: 12px;
          border-radius: 10px;
          background: #f3f5f9;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        [data-theme="dark"] .goal-row {
          background: #17202f;
        }

        .goal-row.completed {
          opacity: 0.7;
        }

        .goal-row.overdue {
          border-left: 4px solid var(--warn);
        }

        .goal-title {
          font-weight: 900;
          margin-bottom: 4px;
        }

        .goal-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 8px;
        }

        .goal-progress {
          margin-top: 8px;
        }

        .goal-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .btn.mini {
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 6px;
        }

        .btn.remove {
          color: var(--warn);
        }

        .empty-state {
          text-align: center;
          color: var(--muted);
          padding: 40px 20px;
          font-style: italic;
        }

        @media (max-width: 600px) {
          .goal-row {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .goal-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}