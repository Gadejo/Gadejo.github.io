import { useState } from 'react';
import { Card, CardBody, Button, PrimaryButton, SecondaryButton, DangerButton } from './ui';
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardBody>
          <details open>
            <summary className="text-lg font-semibold mb-4 cursor-pointer">➕ Add a Goal</summary>
            <form onSubmit={handleSubmitGoal}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <input
                  id="goal-title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="Goal (e.g., 30m vocab)"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <select 
                  id="goal-subject"
                  name="subject"
                  className="form-input"
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
                  className="form-input"
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
                  className="form-input"
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
                  className="form-input"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                
                <select 
                  id="goal-priority"
                  name="priority"
                  className="form-input"
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as 'H' | 'M' | 'L' }))}
                >
                  <option value="H">High</option>
                  <option value="M">Medium</option>
                  <option value="L">Low</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <PrimaryButton type="submit">Add Goal</PrimaryButton>
              </div>
            </form>
            
            <div className="flex gap-2 mt-4">
              <SecondaryButton
                size="sm"
                onClick={() => handleQuickGoal({ title: '15m today', type: 'minutes', target: 15, timeframe: 'today' })}
              >
                📆 Today 15m
              </SecondaryButton>
              <SecondaryButton
                size="sm"
                onClick={() => handleQuickGoal({ title: '3 sessions this week', type: 'sessions', target: 3, timeframe: 'week' })}
              >
                🗓️ Week · 3 sessions
              </SecondaryButton>
            </div>
          </details>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex gap-3 mb-4">
            <select
              id="filter-subject"
              name="filterSubject"
              className="form-input"
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
              className="form-input"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="done">Completed</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="space-y-3">
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
                  <Card
                    key={goal.id}
                    className={`${isCompleted ? 'opacity-70' : ''} ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <CardBody>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{goal.title}</div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                            <span>{subject.config.emoji} {subject.config.name}</span>
                            <span>• {goal.type} · {progress}/{goal.target}</span>
                            {goal.dueDate && <span>• Due {goal.dueDate}</span>}
                            <span>• {goal.priority === 'H' ? 'High' : goal.priority === 'M' ? 'Medium' : 'Low'} priority</span>
                          </div>
                          <div className="progress">
                            <div 
                              className="bar"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: subject.config.color
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <SecondaryButton
                            size="sm"
                            onClick={() => onStartQuest(goal.subjectId)}
                            title="Start quest"
                          >
                            ▶️ Start
                          </SecondaryButton>
                          
                          {goal.type === 'minutes' && (
                            <SecondaryButton
                              size="sm"
                              onClick={() => onQuickAdd(goal.subjectId, 5)}
                              title="Add 5 minutes"
                            >
                              +5m
                            </SecondaryButton>
                          )}
                          
                          {goal.type === 'sessions' && (
                            <SecondaryButton
                              size="sm"
                              onClick={() => onQuickAdd(goal.subjectId, 5)}
                              title="Add 1 session"
                            >
                              +1 session
                            </SecondaryButton>
                          )}
                          
                          {!isCompleted && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleMarkDone(goal.id)}
                              title="Mark as done"
                            >
                              ✔️ Done
                            </Button>
                          )}
                          
                          <DangerButton
                            size="sm"
                            onClick={() => {
                              if (confirm('Remove this goal?')) {
                                onRemoveGoal(goal.id);
                                onShowToast('Goal removed');
                              }
                            }}
                            title="Remove goal"
                          >
                            🗑️
                          </DangerButton>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

    </div>
  );
}