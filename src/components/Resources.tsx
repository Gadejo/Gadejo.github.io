import { useState } from 'react';
import type { SubjectData, Resource } from '../types';

interface ResourcesProps {
  subjects: Record<string, SubjectData>;
  onShowToast: (message: string) => void;
}

export function Resources({ subjects, onShowToast }: ResourcesProps) {
  const [filters, setFilters] = useState({
    search: '',
    subject: 'all',
    priority: 'all'
  });

  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    subjectId: Object.keys(subjects)[0] || '',
    priority: 'M' as 'H' | 'M' | 'L'
  });

  // Collect all resources from all subjects
  const allResources: (Resource & { subjectId: string })[] = [];
  Object.values(subjects).forEach(subject => {
    subject.config.resources.forEach(resource => {
      allResources.push({
        ...resource,
        subjectId: subject.config.id
      });
    });
  });

  const filteredResources = allResources.filter(resource => {
    const searchMatch = !filters.search || 
      resource.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      getHostname(resource.url).toLowerCase().includes(filters.search.toLowerCase());
    
    const subjectMatch = filters.subject === 'all' || resource.subjectId === filters.subject;
    const priorityMatch = filters.priority === 'all' || resource.priority === filters.priority;
    
    return searchMatch && subjectMatch && priorityMatch;
  });

  function getHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.url.trim() || !newResource.subjectId) return;

    if (!/^https?:\/\//i.test(newResource.url)) {
      onShowToast('Please include http:// or https://');
      return;
    }

    // This would need to be handled by a callback to update the subject
    // For now, we'll just show a toast
    onShowToast('Resource functionality coming soon! 📚');
    
    setNewResource({
      title: '',
      url: '',
      subjectId: Object.keys(subjects)[0] || '',
      priority: 'M'
    });
  };

  const handleRandomResource = () => {
    if (filteredResources.length === 0) {
      onShowToast('No resources available');
      return;
    }

    const randomResource = filteredResources[Math.floor(Math.random() * filteredResources.length)];
    window.open(randomResource.url, '_blank', 'noopener,noreferrer');
    onShowToast(`🎲 Surprise: ${randomResource.title}`);
  };

  const getPriorityLabel = (priority: 'H' | 'M' | 'L'): string => {
    return priority === 'H' ? 'High' : priority === 'M' ? 'Medium' : 'Low';
  };

  const getPriorityClass = (priority: 'H' | 'M' | 'L'): string => {
    return `priority-${priority}`;
  };

  if (Object.keys(subjects).length === 0) {
    return (
      <div className="resources-view">
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
          <h3>No Subjects Yet</h3>
          <p>Create a subject first to start adding learning resources!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-view">
      <div className="resource-controls">
        <input
          type="search"
          placeholder="Search title or domain"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        
        <select
          value={filters.subject}
          onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
        >
          <option value="all">All Subjects</option>
          {Object.values(subjects).map(subject => (
            <option key={subject.config.id} value={subject.config.id}>
              {subject.config.emoji} {subject.config.name}
            </option>
          ))}
        </select>
        
        <select
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
        >
          <option value="all">All Priorities</option>
          <option value="H">High</option>
          <option value="M">Medium</option>
          <option value="L">Low</option>
        </select>
        
        <button className="btn" onClick={handleRandomResource}>
          🎲 Surprise me
        </button>
      </div>

      <div className="resource-list">
        {filteredResources.length === 0 ? (
          <div className="empty-resources">
            {allResources.length === 0 
              ? 'No resources yet. Add some below!' 
              : 'No resources match your filters.'}
          </div>
        ) : (
          filteredResources.map(resource => {
            const subject = subjects[resource.subjectId];
            if (!subject) return null;

            return (
              <div
                key={`${resource.subjectId}-${resource.id}`}
                className="resource-item"
                style={{ '--accent': subject.config.color } as React.CSSProperties}
              >
                <div className="resource-content">
                  <div className="resource-title">{resource.title}</div>
                  <div className="resource-meta">
                    <span className="badge">
                      {subject.config.emoji} {subject.config.name}
                    </span>
                    <span className={`badge ${getPriorityClass(resource.priority)}`}>
                      {getPriorityLabel(resource.priority)} priority
                    </span>
                  </div>
                  <div className="resource-url">
                    {getHostname(resource.url)}
                  </div>
                </div>
                
                <a
                  className="btn resource-open"
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open ↗
                </a>
              </div>
            );
          })
        )}
      </div>

      <div className="resource-add">
        <details open>
          <summary>➕ Add Learning Resource</summary>
          <form onSubmit={handleAddResource}>
            <div className="resource-form">
              <input
                type="text"
                placeholder="Title (e.g., Khan Academy - Calculus)"
                value={newResource.title}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              
              <input
                type="url"
                placeholder="https://example.com"
                value={newResource.url}
                onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                required
              />
              
              <select
                value={newResource.subjectId}
                onChange={(e) => setNewResource(prev => ({ ...prev, subjectId: e.target.value }))}
              >
                {Object.values(subjects).map(subject => (
                  <option key={subject.config.id} value={subject.config.id}>
                    {subject.config.emoji} {subject.config.name}
                  </option>
                ))}
              </select>
              
              <select
                value={newResource.priority}
                onChange={(e) => setNewResource(prev => ({ ...prev, priority: e.target.value as 'H' | 'M' | 'L' }))}
              >
                <option value="H">High Priority</option>
                <option value="M">Medium Priority</option>
                <option value="L">Low Priority</option>
              </select>
              
              <button className="btn" type="submit">
                Add Resource
              </button>
            </div>
          </form>
        </details>
      </div>

      <style>{`
        .resources-view {
          max-width: 1000px;
          margin: 0 auto;
        }

        .resource-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .resource-controls input,
        .resource-controls select {
          height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid #cbd3e3;
          background: var(--surface);
          color: var(--text);
          font-family: inherit;
          font-weight: 700;
        }

        [data-theme="dark"] .resource-controls input,
        [data-theme="dark"] .resource-controls select {
          border-color: #2b3853;
        }

        .resource-controls input[type="search"] {
          flex: 1;
          min-width: 200px;
        }

        .resource-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (min-width: 840px) {
          .resource-list {
            grid-template-columns: 1fr 1fr;
          }
        }

        .resource-item {
          position: relative;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          background: var(--surface);
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        [data-theme="dark"] .resource-item {
          border-color: rgba(255, 255, 255, 0.06);
        }

        .resource-item::before {
          content: "";
          position: absolute;
          left: 8px;
          top: 8px;
          bottom: 8px;
          width: 4px;
          border-radius: 4px;
          background: var(--accent, #1976d2);
        }

        .resource-content {
          padding-left: 12px;
        }

        .resource-title {
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .resource-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          margin-bottom: 8px;
        }

        .badge {
          padding: 3px 7px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          background: #eef1f6;
        }

        [data-theme="dark"] .badge {
          background: #17202f;
        }

        .badge.priority-H {
          background: #ffe5c5;
          color: #b45309;
        }

        .badge.priority-M {
          background: #d7e4ff;
          color: #1565c0;
        }

        .badge.priority-L {
          background: #d6f3e3;
          color: #2e7d32;
        }

        [data-theme="dark"] .badge.priority-H {
          background: rgba(255, 183, 77, 0.2);
          color: #ffb74d;
        }

        [data-theme="dark"] .badge.priority-M {
          background: rgba(33, 150, 243, 0.2);
          color: #64b5f6;
        }

        [data-theme="dark"] .badge.priority-L {
          background: rgba(76, 175, 80, 0.2);
          color: #81c784;
        }

        .resource-url {
          color: var(--muted);
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .resource-open {
          align-self: start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 900;
          text-decoration: none;
          color: var(--text);
          transition: all 0.2s ease;
        }

        [data-theme="dark"] .resource-open {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .resource-open:hover {
          background: #f0f2f5;
        }

        [data-theme="dark"] .resource-open:hover {
          background: #1a2333;
        }

        .resource-add {
          background: var(--surface);
          border-radius: var(--r);
          box-shadow: var(--shadow);
          padding: 16px;
        }

        .resource-add details {
          background: none;
          padding: 0;
        }

        .resource-form {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr auto;
          gap: 8px;
          align-items: center;
          margin-top: 12px;
        }

        @media (max-width: 900px) {
          .resource-form {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .resource-form {
            grid-template-columns: 1fr;
          }
        }

        .resource-form input,
        .resource-form select {
          height: 36px;
          border-radius: 10px;
          border: 1px solid #cbd3e3;
          padding: 0 8px;
          background: var(--surface);
          color: var(--text);
          font-family: inherit;
        }

        [data-theme="dark"] .resource-form input,
        [data-theme="dark"] .resource-form select {
          border-color: #2b3853;
        }

        .empty-state {
          text-align: center;
          color: var(--muted);
          padding: 60px 20px;
        }

        .empty-resources {
          text-align: center;
          color: var(--muted);
          padding: 40px 20px;
          font-style: italic;
          grid-column: 1 / -1;
        }

        @media (max-width: 600px) {
          .resource-item {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .resource-open {
            align-self: center;
            justify-self: center;
          }
        }
      `}</style>
    </div>
  );
}