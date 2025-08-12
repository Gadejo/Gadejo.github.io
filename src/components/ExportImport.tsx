import React, { useState, useRef } from 'react';
import type { AppData, Template } from '../types';
import { exportAppData, importAppData, exportTemplate } from '../utils/storage';

interface ExportImportProps {
  data: AppData;
  onImport: (data: AppData) => void;
  onShowToast: (message: string) => void;
}

export function ExportImport({ data, onImport, onShowToast }: ExportImportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const blob = exportAppData(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `adhd-learning-rpg-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      onShowToast('Data exported successfully! 📁');
    } catch (error) {
      console.error('Export failed:', error);
      onShowToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      
      const importedData = await importAppData(file);
      onImport(importedData);
      onShowToast('Data imported successfully! 🎉');
    } catch (error) {
      console.error('Import failed:', error);
      onShowToast('Import failed. Please check your file and try again.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportAsTemplate = () => {
    // Convert current subjects to a template
    const template: Template = {
      id: `template-${Date.now()}`,
      name: 'My Custom Template',
      description: 'Exported from my learning setup',
      category: 'Custom',
      author: 'Me',
      version: '1.0.0',
      subjects: Object.values(data.subjects).map(s => s.config)
    };

    try {
      const blob = exportTemplate(template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `learning-template-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      onShowToast('Template exported! Share with others 🚀');
    } catch (error) {
      console.error('Template export failed:', error);
      onShowToast('Template export failed. Please try again.');
    }
  };

  return (
    <div className="export-import-section">
      <div className="action-group">
        <h3>Backup & Sync</h3>
        <div className="button-row">
          <button 
            className="btn"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '⏳ Exporting...' : '⬇️ Export Data'}
          </button>
          
          <button 
            className="btn"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            {isImporting ? '⏳ Importing...' : '⬆️ Import Data'}
          </button>
        </div>
        <p className="help-text">
          Export your complete learning data for backup or transfer to another device.
        </p>
      </div>

      <div className="action-group">
        <h3>Share Templates</h3>
        <div className="button-row">
          <button 
            className="btn"
            onClick={exportAsTemplate}
          >
            🚀 Export as Template
          </button>
        </div>
        <p className="help-text">
          Create a shareable template from your current subjects (without personal progress data).
        </p>
      </div>

      <input
        ref={fileInputRef}
        id="file-import"
        name="fileImport"
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />

      <div className="import-info">
        <details>
          <summary>Import Guidelines</summary>
          <ul>
            <li><strong>Data Files:</strong> Include all your subjects, sessions, goals, and settings</li>
            <li><strong>Template Files:</strong> Include only subject configurations for sharing</li>
            <li><strong>Compatibility:</strong> Files from v3.x and v4.x are supported</li>
            <li><strong>Merge Strategy:</strong> Imported data replaces current data entirely</li>
          </ul>
        </details>
      </div>

      <style>{`
        .export-import-section {
          background: var(--surface);
          border-radius: var(--r);
          box-shadow: var(--shadow);
          padding: 20px;
          margin: 12px 0;
        }
        
        .action-group {
          margin-bottom: 24px;
        }
        
        .action-group:last-child {
          margin-bottom: 12px;
        }
        
        .action-group h3 {
          margin: 0 0 8px 0;
          color: var(--text);
        }
        
        .button-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        
        .help-text {
          color: var(--muted);
          font-size: 12px;
          margin: 0;
          line-height: 1.4;
        }
        
        .import-info {
          border-top: 1px solid #e7ebf3;
          padding-top: 16px;
          margin-top: 16px;
        }
        
        [data-theme="dark"] .import-info {
          border-top-color: #2b3853;
        }
        
        .import-info details {
          background: none;
          padding: 0;
        }
        
        .import-info summary {
          color: var(--muted);
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }
        
        .import-info ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
        }
        
        .import-info li {
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 4px;
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}