import React from 'react';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';

export default function Navbar({ 
  activeView, 
  activeTag, 
  searchQuery, 
  setSearchQuery, 
  onAddClick,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy
}) {
  const getHeaderDetails = () => {
    if (activeTag) {
      return {
        title: `Tag: #${activeTag}`,
        subtitle: `All vocabulary categorized under "${activeTag}".`
      };
    }

    switch (activeView) {
      case 'favorites':
        return {
          title: 'Favorites Vault',
          subtitle: 'Your curated selection of highly valued words.'
        };
      case 'recent':
        return {
          title: 'Recently Acquired',
          subtitle: 'The latest additions to your mental lexicon.'
        };
      case 'revision':
        return {
          title: 'Revision Center',
          subtitle: 'Active recall and self-testing via digital flashcards.'
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Manage your local vault parameters and database links.'
        };
      case 'about':
        return {
          title: 'About LexVault',
          subtitle: 'A private space to build your lifelong vocabulary.'
        };
      case 'dashboard':
      default:
        return {
          title: 'Personal Vocabulary Vault',
          subtitle: 'A quiet place to build and secure your lifelong English lexicon.'
        };
    }
  };

  const { title, subtitle } = getHeaderDetails();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Only show search & add button on list views (dashboard, favorites, recent, tag filtering)
  const isListView = activeView === 'dashboard' || activeView === 'favorites' || activeView === 'recent';

  return (
    <header className="content-header">
      <div className="header-title-area">
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      {isListView && (
        <div className="header-actions">
          <div className="search-bar-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search words, meanings, synonyms, or notes..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="sort-select"
            title="Sort vocabulary"
          >
            <option value="recent">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="alpha">Alphabetical</option>
          </select>

          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <LayoutGrid size={15} />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>

          <button 
            className="add-vocab-btn" 
            onClick={onAddClick}
            title="Add New Word"
          >
            <Plus size={24} />
          </button>
        </div>
      )}
    </header>
  );
}
