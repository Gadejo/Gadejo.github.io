import React, { useState, useEffect } from 'react';
import type { Template } from '../types';
import { builtInTemplates } from '../utils/defaults';
import { loadUserTemplates, saveUserTemplate, deleteUserTemplate, importTemplate } from '../utils/storage';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: Template) => void;
  onShowToast: (message: string) => void;
}

export function TemplateManager({ 
  isOpen, 
  onClose, 
  onApplyTemplate, 
  onShowToast 
}: TemplateManagerProps) {
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isImportingTemplate, setIsImportingTemplate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUserTemplates().then(setUserTemplates);
    }
  }, [isOpen]);

  const allTemplates = [...builtInTemplates, ...userTemplates];
  const categories = ['all', ...Array.from(new Set(allTemplates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === selectedCategory);

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate(template);
    onClose();
    onShowToast(`Applied template: ${template.name} 🎨`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (builtInTemplates.find(t => t.id === templateId)) {
      onShowToast('Cannot delete built-in templates');
      return;
    }

    if (confirm('Are you sure you want to delete this template?')) {
      deleteUserTemplate(templateId);
      setUserTemplates(prev => prev.filter(t => t.id !== templateId));
      onShowToast('Template deleted');
    }
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImportingTemplate(true);

    importTemplate(file)
      .then(template => {
        saveUserTemplate(template);
        setUserTemplates(prev => [...prev, template]);
        onShowToast(`Template imported: ${template.name} 🎉`);
      })
      .catch(error => {
        console.error('Template import failed:', error);
        onShowToast('Template import failed. Please check the file.');
      })
      .finally(() => {
        setIsImportingTemplate(false);
        event.target.value = '';
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal template-modal">
        <div className="modal-header">
          <h2>Learning Templates</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="template-controls">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '16px' }}>
            <select 
              className="" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ flex: 1 }}
            >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
            </select>
            
            <label className="btn" style={{ cursor: 'pointer' }}>
                {isImportingTemplate ? '⏳ Importing...' : '📥 Import Template'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTemplate}
                  disabled={isImportingTemplate}
                  style={{ display: 'none' }}
                />
              </label>
          </div>
        </div>

        <div className="modal-body template-scroll-area">
          {filteredTemplates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No templates found in this category.
            </div>
          ) : (
            <>
              <div className="template-grid">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isBuiltIn={builtInTemplates.some(t => t.id === template.id)}
                    onApply={() => handleApplyTemplate(template)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
              {filteredTemplates.length > 6 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '12px', 
                  color: 'var(--muted)', 
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  ↕️ Scroll to see more templates
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  isBuiltIn: boolean;
  onApply: () => void;
  onDelete: () => void;
}

function TemplateCard({ template, isBuiltIn, onApply, onDelete }: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="template-card">
      <div className="template-header">
        <div>
          <h3>{template.name}</h3>
          <div className="template-meta">
            <span className="badge">{template.category}</span>
            <span className="badge">{template.subjects.length} subjects</span>
            {isBuiltIn && <span className="badge built-in">Built-in</span>}
          </div>
        </div>
      </div>

      <p className="template-description">
        {template.description}
      </p>

      <details 
        open={expanded}
        onToggle={(e) => setExpanded((e.target as HTMLDetailsElement).open)}
      >
        <summary>View Subjects</summary>
        <div className="subject-preview-list">
          {template.subjects.map(subject => (
            <div key={subject.id} className="subject-preview-item">
              <span style={{ fontSize: '16px' }}>{subject.emoji}</span>
              <span>{subject.name}</span>
              <span className="subject-meta">
                {subject.questTypes.length} quests • {subject.achievements.length} achievements
              </span>
            </div>
          ))}
        </div>
      </details>

      <div className="template-actions">
        <button 
          className="btn btn-primary"
          onClick={onApply}
        >
          Apply Template
        </button>
        
        {!isBuiltIn && (
          <button 
            className="btn"
            onClick={onDelete}
            style={{ color: 'var(--warn)' }}
          >
            Delete
          </button>
        )}
      </div>

      <div className="template-footer">
        <small>
          by {template.author} • v{template.version}
        </small>
      </div>

    </div>
  );
}