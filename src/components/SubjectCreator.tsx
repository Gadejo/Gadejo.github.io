import { useState } from 'react';
import type { SubjectConfig } from '../types';
import { createEmptySubjectConfig, defaultQuestTypes, defaultAchievements } from '../utils/defaults';

interface SubjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SubjectConfig) => void;
}

const EMOJI_OPTIONS = ['📚', '🎯', '🎨', '🏃', '🎵', '🔬', '💻', '📝', '🌱', '⚡', '🎲', '🔥', '💎', '🏆'];
const COLOR_OPTIONS = ['#1976d2', '#d32f2f', '#388e3c', '#7b1fa2', '#ff9800', '#795548', '#607d8b', '#e91e63'];

export function SubjectCreator({ isOpen, onClose, onSave }: SubjectCreatorProps) {
  const [config, setConfig] = useState<Partial<SubjectConfig>>(() => createEmptySubjectConfig());
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Basic Info',
    'Quest Types', 
    'Achievements',
    'Settings',
    'Review'
  ];

  if (!isOpen) return null;

  const handleSave = () => {
    if (config.name && config.emoji && config.color) {
      const fullConfig: SubjectConfig = {
        id: `subject-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: config.name,
        emoji: config.emoji,
        color: config.color,
        achievements: config.achievements || defaultAchievements,
        questTypes: config.questTypes || defaultQuestTypes,
        pipAmount: config.pipAmount || 5,
        targetHours: config.targetHours || 8,
        resources: config.resources || []
      };
      onSave(fullConfig);
      onClose();
      setConfig(createEmptySubjectConfig());
      setCurrentStep(0);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return config.name && config.emoji && config.color;
      case 1:
        return config.questTypes && config.questTypes.length > 0;
      case 2:
        return config.achievements && config.achievements.length > 0;
      case 3:
        return config.pipAmount && config.targetHours;
      default:
        return true;
    }
  };

  const renderBasicInfo = () => (
    <div className="creator-step">
      <h3>Subject Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Subject Name *</label>
          <input
            type="text"
            id="subject-name"
            name="name"
            placeholder="e.g., Guitar Practice"
            value={config.name || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Emoji *</label>
          <div className="emoji-grid">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className={`emoji-option ${config.emoji === emoji ? 'selected' : ''}`}
                onClick={() => setConfig(prev => ({ ...prev, emoji }))}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Theme Color *</label>
          <div className="color-grid">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                type="button"
                className={`color-option ${config.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setConfig(prev => ({ ...prev, color }))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestTypes = () => (
    <div className="creator-step">
      <h3>Quest Types</h3>
      <p>Define different types of study sessions for this subject.</p>
      <div className="quest-list">
        {(config.questTypes || defaultQuestTypes).map((quest, index) => (
          <div key={index} className="quest-item">
            <input
              id={`quest-name-${index}`}
              name={`questName${index}`}
              placeholder="Name (e.g., Practice)"
              value={quest.name}
              onChange={(e) => {
                const newQuests = [...(config.questTypes || defaultQuestTypes)];
                newQuests[index] = { ...quest, name: e.target.value };
                setConfig(prev => ({ ...prev, questTypes: newQuests }));
              }}
            />
            <input
              type="number"
              id={`quest-duration-${index}`}
              name={`questDuration${index}`}
              placeholder="Duration (min)"
              value={quest.duration}
              onChange={(e) => {
                const newQuests = [...(config.questTypes || defaultQuestTypes)];
                newQuests[index] = { ...quest, duration: parseInt(e.target.value) || 0 };
                setConfig(prev => ({ ...prev, questTypes: newQuests }));
              }}
            />
            <input
              type="number"
              id={`quest-xp-${index}`}
              name={`questXp${index}`}
              placeholder="XP"
              value={quest.xp}
              onChange={(e) => {
                const newQuests = [...(config.questTypes || defaultQuestTypes)];
                newQuests[index] = { ...quest, xp: parseInt(e.target.value) || 0 };
                setConfig(prev => ({ ...prev, questTypes: newQuests }));
              }}
            />
            <input
              id={`quest-emoji-${index}`}
              name={`questEmoji${index}`}
              placeholder="Emoji"
              value={quest.emoji}
              onChange={(e) => {
                const newQuests = [...(config.questTypes || defaultQuestTypes)];
                newQuests[index] = { ...quest, emoji: e.target.value };
                setConfig(prev => ({ ...prev, questTypes: newQuests }));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="creator-step">
      <h3>Achievement Tiers</h3>
      <p>Set milestones based on consecutive study days.</p>
      <div className="achievement-list">
        {(config.achievements || defaultAchievements).map((achievement, index) => (
          <div key={index} className="achievement-item">
            <input
              id={`achievement-name-${index}`}
              name={`achievementName${index}`}
              placeholder="Achievement Name"
              value={achievement.name}
              onChange={(e) => {
                const newAchievements = [...(config.achievements || defaultAchievements)];
                newAchievements[index] = { ...achievement, name: e.target.value };
                setConfig(prev => ({ ...prev, achievements: newAchievements }));
              }}
            />
            <input
              type="number"
              id={`achievement-streak-${index}`}
              name={`achievementStreak${index}`}
              placeholder="Days Required"
              value={achievement.streakRequired}
              onChange={(e) => {
                const newAchievements = [...(config.achievements || defaultAchievements)];
                newAchievements[index] = { ...achievement, streakRequired: parseInt(e.target.value) || 0 };
                setConfig(prev => ({ ...prev, achievements: newAchievements }));
              }}
            />
            <input
              id={`achievement-emoji-${index}`}
              name={`achievementEmoji${index}`}
              placeholder="Emoji"
              value={achievement.emoji}
              onChange={(e) => {
                const newAchievements = [...(config.achievements || defaultAchievements)];
                newAchievements[index] = { ...achievement, emoji: e.target.value };
                setConfig(prev => ({ ...prev, achievements: newAchievements }));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="creator-step">
      <h3>Subject Settings</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Daily Pip Amount (minutes)</label>
          <input
            type="number"
            id="pip-amount"
            name="pipAmount"
            min="1"
            value={config.pipAmount || 5}
            onChange={(e) => setConfig(prev => ({ ...prev, pipAmount: parseInt(e.target.value) || 5 }))}
          />
          <small>Minutes added when clicking a daily pip</small>
        </div>
        
        <div className="form-group">
          <label>Target Hours</label>
          <input
            type="number"
            id="target-hours"
            name="targetHours"
            min="1"
            value={config.targetHours || 8}
            onChange={(e) => setConfig(prev => ({ ...prev, targetHours: parseInt(e.target.value) || 8 }))}
          />
          <small>Total hours goal for progress bar</small>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="creator-step">
      <h3>Review & Create</h3>
      <div className="subject-preview">
        <div className="preview-header">
          <span style={{ fontSize: '24px' }}>{config.emoji}</span>
          <h4>{config.name}</h4>
        </div>
        <div className="preview-details">
          <p><strong>Quest Types:</strong> {config.questTypes?.length || 0}</p>
          <p><strong>Achievement Tiers:</strong> {config.achievements?.length || 0}</p>
          <p><strong>Pip Amount:</strong> {config.pipAmount}m</p>
          <p><strong>Target Hours:</strong> {config.targetHours}h</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderQuestTypes();
      case 2: return renderAchievements();
      case 3: return renderSettings();
      case 4: return renderReview();
      default: return renderBasicInfo();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Subject</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="wizard-progress">
          {steps.map((step, index) => (
            <div 
              key={step}
              className={`wizard-step ${index <= currentStep ? 'active' : ''}`}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-name">{step}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {renderCurrentStep()}
        </div>

        <div className="modal-footer">
          {currentStep > 0 && (
            <button 
              className="btn"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            >
              Back
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!canProceed()}
            >
              Create Subject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}