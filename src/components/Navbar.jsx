import React, { useEffect, useRef } from 'react';
import { Search, Plus, LayoutGrid, List, Menu, SlidersHorizontal } from 'lucide-react';

export default function Navbar({
  activeView,
  activeTag,
  searchQuery,
  setSearchQuery,
  onAddClick,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  onOpenCommandPalette,
  vocabularyCount,
  onOpenMobileMenu,
}) {
  const searchRef = useRef(null);

  useEffect(() => {
    const handleFocusShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') return;
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleFocusShortcut);
    return () => window.removeEventListener('keydown', handleFocusShortcut);
  }, []);

  const getHeaderDetails = () => {
    if (activeTag) return { eyebrow: 'Collection', title: `#${activeTag}`, subtitle: `A focused view of words tagged “${activeTag}”.` };
    switch (activeView) {
      case 'favorites': return { eyebrow: 'Curated', title: 'Favorites', subtitle: 'The words you decided deserve a place of honor.' };
      case 'recent': return { eyebrow: 'Chronicle', title: 'Recently Added', subtitle: 'The newest additions to your personal lexicon.' };
      case 'revision': return { eyebrow: 'Practice', title: 'Revision Mode', subtitle: 'A short active-recall session for sharper retention.' };
      case 'settings': return { eyebrow: 'Configuration', title: 'Settings', subtitle: 'Keep your vault portable, private, and yours.' };
      case 'about': return { eyebrow: 'Manifesto', title: 'About VocabVault', subtitle: 'A personal system for taking language seriously.' };
      default: return { eyebrow: 'Your workspace', title: 'Vocabulary Vault', subtitle: 'Collect precisely. Remember deliberately.' };
    }
  };

  const { eyebrow, title, subtitle } = getHeaderDetails();
  const isListView = ['dashboard', 'favorites', 'recent'].includes(activeView);

  return (
    <header className="content-header">
      <div className="mobile-header-row">
        <button className="mobile-menu-btn" onClick={onOpenMobileMenu} aria-label="Open navigation"><Menu size={20} /></button>
        <div className="mobile-wordmark"><span className="brand-mark"><Search size={14} /></span>Vocab<span className="brand-accent">Vault</span></div>
      </div>
      <div className="header-title-area">
        <span className="header-eyebrow">{eyebrow}</span>
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      {isListView && (
        <div className="header-actions">
          <div className="search-bar-container">
            <Search className="search-icon" size={18} />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search words, meanings, notes…"
              className="search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search vocabulary"
            />
            <button className="search-shortcut" onClick={onOpenCommandPalette} aria-label="Open command palette"><span>⌘</span>K</button>
          </div>
          <div className="toolbar-meta"><span>{vocabularyCount} {vocabularyCount === 1 ? 'entry' : 'entries'}</span></div>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="sort-select" title="Sort vocabulary" aria-label="Sort vocabulary">
            <option value="recent">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">A → Z</option>
          </select>
          <div className="view-toggle" aria-label="View mode">
            <button className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')} title="Card view" aria-label="Card view"><LayoutGrid size={15} /></button>
            <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view" aria-label="List view"><List size={15} /></button>
          </div>
          <button className="add-vocab-btn" onClick={onAddClick} title="Add a new word" aria-label="Add a new word"><Plus size={22} /></button>
        </div>
      )}
      {!isListView && <div className="header-utility-mark"><SlidersHorizontal size={17} /><span>Focused view</span></div>}
    </header>
  );
}
