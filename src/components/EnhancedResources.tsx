import { useState, useMemo } from 'react';
import type { SubjectData, Resource } from '../types';

interface ResourceWithSubject extends Resource {
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  subjectColor: string;
}

interface EnhancedResourcesProps {
  subjects: Record<string, SubjectData>;
  onShowToast: (message: string) => void;
}

export function EnhancedResources({ subjects, onShowToast }: EnhancedResourcesProps) {
  const [filters, setFilters] = useState({
    search: '',
    subject: 'all',
    priority: 'all',
    category: 'all'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'subject' | 'recent'>('priority');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(JSON.parse(localStorage.getItem('favoriteResources') || '[]')));
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(JSON.parse(localStorage.getItem('recentResources') || '[]'));
  const [resourceStats, setResourceStats] = useState<Record<string, number>>(JSON.parse(localStorage.getItem('resourceStats') || '{}'));
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Collect all resources with enhanced metadata
  const allResources: ResourceWithSubject[] = useMemo(() => {
    const resources: ResourceWithSubject[] = [];
    
    Object.values(subjects).forEach(subject => {
      subject.config.resources.forEach(resource => {
        resources.push({
          ...resource,
          subjectId: subject.config.id,
          subjectName: subject.config.name,
          subjectEmoji: subject.config.emoji,
          subjectColor: subject.config.color
        });
      });
    });
    
    return resources;
  }, [subjects]);

  // Enhanced filtering, sorting and pagination
  const { paginatedResources, totalPages, totalResources } = useMemo(() => {
    let filtered = allResources.filter(resource => {
      const searchMatch = !filters.search || 
        resource.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        getHostname(resource.url).toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.subjectName.toLowerCase().includes(filters.search.toLowerCase());
      
      const subjectMatch = filters.subject === 'all' || resource.subjectId === filters.subject;
      const priorityMatch = filters.priority === 'all' || resource.priority === filters.priority;
      
      // Category filtering based on resource types
      const categoryMatch = filters.category === 'all' || matchesCategory(resource, filters.category);
      
      return searchMatch && subjectMatch && priorityMatch && categoryMatch;
    });

    // Advanced sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { 'H': 3, 'M': 2, 'L': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'subject':
          return a.subjectName.localeCompare(b.subjectName);
        case 'recent':
          const aIndex = recentlyUsed.indexOf(a.id);
          const bIndex = recentlyUsed.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        default:
          return 0;
      }
    });

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    return {
      paginatedResources: paginatedResults,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      totalResources: filtered.length
    };
  }, [allResources, filters, sortBy, recentlyUsed, currentPage, itemsPerPage]);
  
  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  function getHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function matchesCategory(resource: ResourceWithSubject, category: string): boolean {
    const url = resource.url.toLowerCase();
    const title = resource.title.toLowerCase();
    
    switch (category) {
      case 'video':
        return url.includes('youtube') || url.includes('vimeo') || title.includes('video');
      case 'interactive':
        return url.includes('codecademy') || url.includes('freecodecamp') || url.includes('brilliant') || title.includes('interactive');
      case 'documentation':
        return url.includes('docs') || url.includes('documentation') || title.includes('docs') || title.includes('guide');
      case 'practice':
        return url.includes('exercism') || url.includes('leetcode') || url.includes('codewars') || title.includes('practice') || title.includes('exercise');
      case 'tools':
        return url.includes('app') || title.includes('tool') || title.includes('calculator') || title.includes('editor');
      default:
        return true;
    }
  }

  const toggleFavorite = (resourceId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(resourceId)) {
      newFavorites.delete(resourceId);
    } else {
      newFavorites.add(resourceId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteResources', JSON.stringify([...newFavorites]));
  };

  const trackResourceUsage = (resource: ResourceWithSubject) => {
    // Update recently used
    const newRecent = [resource.id, ...recentlyUsed.filter(id => id !== resource.id)].slice(0, 20);
    setRecentlyUsed(newRecent);
    localStorage.setItem('recentResources', JSON.stringify(newRecent));

    // Update usage stats
    const newStats = { ...resourceStats };
    newStats[resource.id] = (newStats[resource.id] || 0) + 1;
    setResourceStats(newStats);
    localStorage.setItem('resourceStats', JSON.stringify(newStats));

    // Open resource
    window.open(resource.url, '_blank', 'noopener,noreferrer');
    onShowToast(`📚 Opening: ${resource.title}`);
  };

  const handleRandomResource = () => {
    if (totalResources === 0) {
      onShowToast('No resources available');
      return;
    }

    // Get all filtered resources (not just current page) for random selection
    const allFiltered = allResources.filter(resource => {
      const searchMatch = !filters.search || 
        resource.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        getHostname(resource.url).toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.subjectName.toLowerCase().includes(filters.search.toLowerCase());
      const subjectMatch = filters.subject === 'all' || resource.subjectId === filters.subject;
      const priorityMatch = filters.priority === 'all' || resource.priority === filters.priority;
      const categoryMatch = filters.category === 'all' || matchesCategory(resource, filters.category);
      return searchMatch && subjectMatch && priorityMatch && categoryMatch;
    });

    // Weighted random selection favoring high priority resources
    const weightedResources = allFiltered.flatMap(resource => {
      const weight = resource.priority === 'H' ? 3 : resource.priority === 'M' ? 2 : 1;
      return Array(weight).fill(resource);
    });

    const randomResource = weightedResources[Math.floor(Math.random() * weightedResources.length)];
    trackResourceUsage(randomResource);
    onShowToast(`🎲 Surprise discovery: ${randomResource.title}`);
  };

  const getResourceMetrics = () => {
    const totalResources = allResources.length;
    const highPriority = allResources.filter(r => r.priority === 'H').length;
    const subjectCounts = Object.values(subjects).reduce((acc, subject) => {
      acc[subject.config.name] = subject.config.resources.length;
      return acc;
    }, {} as Record<string, number>);

    return { totalResources, highPriority, subjectCounts };
  };

  const metrics = getResourceMetrics();

  if (Object.keys(subjects).length === 0) {
    return (
      <div className="enhanced-resources-view">
        <div className="empty-state">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔗</div>
          <h2>Resource Library Awaits</h2>
          <p>Create your first subject to unlock curated learning resources!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-resources-view">
      {/* Header Stats */}
      <div className="resource-stats">
        <div 
          className="stat-card" 
        >
          <div className="stat-number">{metrics.totalResources}</div>
          <div className="stat-label">Total Resources</div>
        </div>
        <div 
          className="stat-card" 
        >
          <div className="stat-number">{metrics.highPriority}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div 
          className="stat-card" 
        >
          <div className="stat-number">{favorites.size}</div>
          <div className="stat-label">Favorites</div>
        </div>
        <div 
          className="stat-card" 
        >
          <div className="stat-number">{Object.keys(subjects).length}</div>
          <div className="stat-label">Subjects</div>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="resource-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              id="resource-search"
              name="search"
              placeholder="Search resources, domains, or subjects..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            id="resource-subject-filter"
            name="subjectFilter"
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
            id="resource-category-filter"
            name="categoryFilter"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">All Types</option>
            <option value="video">🎥 Videos</option>
            <option value="interactive">⚡ Interactive</option>
            <option value="documentation">📚 Docs</option>
            <option value="practice">💪 Practice</option>
            <option value="tools">🛠️ Tools</option>
          </select>

          <select
            id="resource-priority-filter"
            name="priorityFilter"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="all">All Priorities</option>
            <option value="H">🔥 High Priority</option>
            <option value="M">⚡ Medium Priority</option>
            <option value="L">💡 Low Priority</option>
          </select>

          <select
            id="resource-sort"
            name="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="subject">Sort by Subject</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>

        <div className="action-section">
          <div className="view-toggles">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ≡
            </button>
            <button 
              className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
              title="Compact view"
            >
              ☰
            </button>
          </div>

          <button className="btn surprise-btn" onClick={handleRandomResource}>
            🎲 Surprise Me
          </button>
        </div>
      </div>

      {/* Results Count & Pagination Controls */}
      <div className="results-info">
        <div className="results-text">
          <span>
            {totalResources} resource{totalResources !== 1 ? 's' : ''} found
            {filters.search && ` for "${filters.search}"`}
          </span>
          {totalPages > 1 && (
            <span className="page-info">• Page {currentPage} of {totalPages}</span>
          )}
        </div>
        
        <div className="pagination-controls">
          <div 
            className="" 
          >
            <select 
              id="items-per-page"
              name="itemsPerPage"
              value={itemsPerPage} 
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className="items-per-page"
            >
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div className={`resource-list view-${viewMode}`}>
        {paginatedResources.length === 0 ? (
          <div className="empty-results">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3>No resources match your filters</h3>
            <p>Try adjusting your search criteria or explore different categories.</p>
          </div>
        ) : (
          paginatedResources.map((resource, index) => (
            <ResourceCard
              key={`${resource.subjectId}-${resource.id}`}
              resource={resource}
              viewMode={viewMode}
              isFavorite={favorites.has(resource.id)}
              usageCount={resourceStats[resource.id] || 0}
              isRecent={recentlyUsed.slice(0, 5).includes(resource.id)}
              onToggleFavorite={() => toggleFavorite(resource.id)}
              onOpen={() => trackResourceUsage(resource)}
              animationDelay={index * 50}
            />
          ))
        )}
      </div>
      
      {/* Pagination Navigation */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            ≪
          </button>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            ≫
          </button>
        </div>
      )}

      <style>{`
        .enhanced-resources-view {
          max-width: 1400px;
          margin: 0 auto;
        }

        .resource-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--surface);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 16px;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          animation: statCardSlideIn 0.8s ease-out forwards;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0ms; }
        .stat-card:nth-child(2) { animation-delay: 100ms; }
        .stat-card:nth-child(3) { animation-delay: 200ms; }
        .stat-card:nth-child(4) { animation-delay: 300ms; }
        
        @keyframes statCardSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .stat-card:hover {
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 12px 30px rgba(43, 124, 255, 0.15);
        }

        .stat-number {
          font-size: 24px;
          font-weight: 900;
          color: var(--info);
        }

        .stat-label {
          font-size: 12px;
          color: var(--muted);
          font-weight: 700;
        }

        .resource-controls {
          background: var(--surface);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 20px;
          margin-bottom: 16px;
          display: grid;
          gap: 16px;
        }

        .search-section {
          display: flex;
          justify-content: center;
        }

        .search-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
        }

        .search-input-wrapper input {
          width: 100%;
          height: 44px;
          padding: 0 16px 0 40px;
          border-radius: 22px;
          border: 2px solid #e7ebf3;
          background: var(--bg);
          color: var(--text);
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .search-input-wrapper input:focus {
          border-color: var(--info);
          box-shadow: 0 0 0 3px rgba(43, 124, 255, 0.1);
          outline: none;
        }

        .filter-section {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-section select {
          height: 36px;
          padding: 0 12px;
          border-radius: 18px;
          border: 1px solid #cbd3e3;
          background: var(--bg);
          color: var(--text);
          font-family: inherit;
          font-weight: 600;
          font-size: 13px;
        }

        .action-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .view-toggles {
          display: flex;
          gap: 4px;
          background: #f0f2f5;
          padding: 4px;
          border-radius: 8px;
        }

        [data-theme="dark"] .view-toggles {
          background: var(--color-gray-200);
        }

        .view-btn {
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          color: var(--muted);
          transition: all 0.2s ease;
        }

        .view-btn:hover,
        .view-btn.active {
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .surprise-btn {
          background: linear-gradient(45deg, #ff6b35, #f7931e);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .surprise-btn:hover {
          transform: scale(1.05);
        }

        .results-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .results-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .page-info {
          font-size: 12px;
          opacity: 0.8;
        }
        
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .items-per-page {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #cbd3e3;
          background: var(--surface);
          color: var(--text);
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          margin-top: 24px;
          padding: 20px 0;
          animation: paginationSlideUp 0.6s ease-out;
        }
        
        @keyframes paginationSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .pagination-btn {
          min-width: 36px;
          height: 36px;
          border: 1px solid #cbd3e3;
          background: var(--surface);
          color: var(--text);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .pagination-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(43, 124, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: var(--info);
          color: white;
          border-color: var(--info);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 20px rgba(43, 124, 255, 0.3);
        }
        
        .pagination-btn:hover:not(:disabled)::before {
          width: 50px;
          height: 50px;
        }
        
        .pagination-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.95);
        }
        
        .pagination-btn.active {
          background: var(--info);
          color: white;
          border-color: var(--info);
          animation: pageButtonPulse 2s ease-in-out infinite;
        }
        
        @keyframes pageButtonPulse {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(43, 124, 255, 0.2);
          }
          50% {
            box-shadow: 0 4px 16px rgba(43, 124, 255, 0.4);
          }
        }
        
        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .resource-list {
          display: grid;
          gap: 16px;
        }

        .resource-list.view-grid {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }

        .resource-list.view-list {
          grid-template-columns: 1fr;
        }

        .resource-list.view-compact {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .empty-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        .empty-state {
          text-align: center;
          color: var(--muted);
          padding: 80px 20px;
        }

        @media (max-width: 768px) {
          .filter-section {
            justify-content: stretch;
          }
          
          .filter-section select {
            flex: 1;
            min-width: 120px;
          }
          
          .action-section {
            flex-direction: column;
            gap: 12px;
          }
          
          .resource-list.view-grid {
            grid-template-columns: 1fr;
          }
          
          .results-info {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .pagination {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .pagination-btn {
            min-width: 32px;
            height: 32px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

interface ResourceCardProps {
  resource: ResourceWithSubject;
  viewMode: 'grid' | 'list' | 'compact';
  isFavorite: boolean;
  usageCount: number;
  isRecent: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
  animationDelay?: number;
}

function ResourceCard({ 
  resource, 
  viewMode, 
  isFavorite, 
  usageCount, 
  isRecent,
  onToggleFavorite, 
  onOpen,
  animationDelay = 0
}: ResourceCardProps) {
  const getPriorityInfo = (priority: 'H' | 'M' | 'L') => {
    switch (priority) {
      case 'H': return { label: 'High Priority', emoji: '🔥', class: 'priority-high' };
      case 'M': return { label: 'Medium Priority', emoji: '⚡', class: 'priority-medium' };
      case 'L': return { label: 'Low Priority', emoji: '💡', class: 'priority-low' };
    }
  };

  const priorityInfo = getPriorityInfo(resource.priority);
  const hostname = resource.url.replace(/^https?:\/\//, '').split('/')[0];

  return (
    <div 
      className={`resource-card view-${viewMode} ${isRecent ? 'recent' : ''}`}
      style={{ 
        '--accent': resource.subjectColor,
        animationDelay: `${animationDelay}ms`
      } as React.CSSProperties}
    >
      <div className="card-header">
        <div className="resource-title">{resource.title}</div>
        <div className="resource-actions">
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="resource-meta">
          <span className="subject-badge">
            {resource.subjectEmoji} {resource.subjectName}
          </span>
          <span className={`priority-badge ${priorityInfo.class}`}>
            {priorityInfo.emoji} {priorityInfo.label}
          </span>
          {isRecent && <span className="recent-badge">🕒 Recent</span>}
          {usageCount > 0 && (
            <span className="usage-badge" title={`Opened ${usageCount} times`}>
              👁️ {usageCount}
            </span>
          )}
        </div>

        <div className="resource-url">{hostname}</div>
      </div>

      <div className="card-footer">
        <button 
          className="open-btn"
          onClick={onOpen}
        >
          Open Resource ↗
        </button>
      </div>

      <style>{`
        .resource-card {
          background: var(--surface);
          border-radius: 12px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: resourceCardEnter 0.6s ease-out forwards;
        }
        
        @keyframes resourceCardEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        [data-theme="dark"] .resource-card {
          border-color: var(--color-gray-200);
        }

        .resource-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--accent);
        }

        .resource-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 35px rgba(0,0,0,0.15);
        }
        
        .resource-card:active {
          transform: translateY(-1px) scale(0.98);
        }

        .resource-card.recent {
          background: linear-gradient(135deg, var(--surface) 0%, rgba(43, 124, 255, 0.02) 100%);
        }

        .resource-card.view-compact {
          padding: 12px;
        }

        .resource-card.view-grid,
        .resource-card.view-list {
          padding: 16px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .resource-title {
          font-weight: 900;
          line-height: 1.3;
          flex: 1;
          margin-right: 8px;
        }

        .resource-card.view-compact .resource-title {
          font-size: 14px;
        }

        .favorite-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: transform 0.2s ease;
        }

        .favorite-btn:hover {
          transform: scale(1.1);
        }

        .resource-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .subject-badge,
        .priority-badge,
        .recent-badge,
        .usage-badge {
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          background: #f0f2f5;
        }

        [data-theme="dark"] .subject-badge,
        [data-theme="dark"] .priority-badge,
        [data-theme="dark"] .recent-badge,
        [data-theme="dark"] .usage-badge {
          background: var(--color-gray-200);
        }

        .priority-high {
          background: rgba(255, 107, 53, 0.15);
          color: #ff4422;
        }

        .priority-medium {
          background: rgba(43, 124, 255, 0.15);
          color: #2b7cff;
        }

        .priority-low {
          background: rgba(76, 175, 80, 0.15);
          color: #4caf50;
        }

        .recent-badge {
          background: rgba(156, 39, 176, 0.15);
          color: #9c27b0;
        }

        .usage-badge {
          background: rgba(255, 152, 0, 0.15);
          color: #ff9800;
        }

        .resource-url {
          color: var(--muted);
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-footer {
          margin-top: 12px;
        }

        .open-btn {
          width: 100%;
          padding: 8px 16px;
          border: 2px solid var(--accent);
          background: transparent;
          color: var(--accent);
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .open-btn:hover {
          background: var(--accent);
          color: white;
        }

        .resource-card.view-list {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 16px;
        }

        .resource-card.view-list .card-footer {
          margin-top: 0;
        }

        .resource-card.view-list .open-btn {
          width: auto;
          min-width: 120px;
        }
      `}</style>
    </div>
  );
}