import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardFooter, PrimaryButton, SecondaryButton, DangerButton, Badge } from './ui';
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold">📚 Learning Templates</h2>
            <SecondaryButton size="sm" onClick={onClose}>✕</SecondaryButton>
          </div>
        </CardHeader>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3 items-center">
            <select 
              id="template-category"
              name="templateCategory"
              className="form-input flex-1"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <label 
              className={`btn btn-secondary ${isImportingTemplate ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            >
              {isImportingTemplate ? '⏳ Importing...' : '📥 Import Template'}
              <input
                id="template-import"
                name="templateImport"
                type="file"
                accept=".json"
                onChange={handleImportTemplate}
                disabled={isImportingTemplate}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <CardBody className="max-h-96 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No templates found in this category.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="text-center text-xs text-gray-500 opacity-70 py-3">
                  ↕️ Scroll to see more templates
                </div>
              )}
            </>
          )}
        </CardBody>

        <CardFooter className="flex justify-end">
          <SecondaryButton onClick={onClose}>
            Close
          </SecondaryButton>
        </CardFooter>
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
    <Card className="hover-lift">
      <CardHeader>
        <div className="w-full">
          <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" size="sm">{template.category}</Badge>
            <Badge variant="gray" size="sm">{template.subjects.length} subjects</Badge>
            {isBuiltIn && <Badge variant="success" size="sm">Built-in</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <p className="text-sm text-gray-600 mb-4">
          {template.description}
        </p>

        <details 
          open={expanded}
          onToggle={(e) => setExpanded((e.target as HTMLDetailsElement).open)}
          className="mb-4"
        >
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            View Subjects
          </summary>
          <div className="mt-3 space-y-2">
            {template.subjects.map(subject => (
              <div key={subject.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <span className="text-lg">{subject.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{subject.name}</div>
                  <div className="text-xs text-gray-500">
                    {subject.questTypes.length} quests • {subject.achievements.length} achievements
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>

        <div className="text-xs text-gray-500 mb-4">
          by {template.author} • v{template.version}
        </div>
      </CardBody>

      <CardFooter className="flex gap-2">
        <PrimaryButton 
          onClick={onApply}
          className="flex-1"
        >
          Apply Template
        </PrimaryButton>
        
        {!isBuiltIn && (
          <DangerButton 
            size="sm"
            onClick={onDelete}
          >
            Delete
          </DangerButton>
        )}
      </CardFooter>
    </Card>
  );
}