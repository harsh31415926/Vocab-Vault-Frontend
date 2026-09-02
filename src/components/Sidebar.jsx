import React, { useMemo } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  Star,
  Clock3,
  Layers,
  Flame,
  Settings,
  Info,
  LogOut,
  Hash,
  Sun,
  Moon,
  X,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  activeTag,
  setActiveTag,
  vocabularies,
  user,
  onLogout,
  theme = 'dark',
  onThemeToggle,
  isMobileMenuOpen = false,
  onCloseMobileMenu,
}) {
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    vocabularies.forEach((vocab) => {
      (Array.isArray(vocab.tags) ? vocab.tags : []).forEach((tag) => {
        if (tag && tag.trim()) tagsSet.add(tag.trim());
      });
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [vocabularies]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Your full collection' },
    { id: 'favorites', label: 'Favorites', icon: Star, hint: 'Words worth keeping close' },
    { id: 'recent', label: 'Recently Added', icon: Clock3, hint: 'Your latest discoveries' },
    { id: 'revision', label: 'Revision Mode', icon: Layers, hint: 'Practice active recall' },
    { id: 'daily-challenges', label: 'Daily Challenges', icon: Flame, hint: 'Small daily actions' },
  ];
  const utilityItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  const navigate = (viewId) => {
    setActiveView(viewId);
    setActiveTag(null);
    onCloseMobileMenu?.();
  };

  return (
    <>
      {isMobileMenuOpen && <button className="mobile-sidebar-backdrop" aria-label="Close navigation" onClick={onCloseMobileMenu} />}
      <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <div className="sidebar-logo">
              <span className="brand-mark"><BookOpen size={18} /></span>
              <span>Vocab<span className="brand-accent">Vault</span></span>
            </div>
            <button className="mobile-close-btn" onClick={onCloseMobileMenu} aria-label="Close navigation"><X size={19} /></button>
          </div>

          <div className="sidebar-kicker">Personal lexicon <span>·</span> v1.0</div>

          <nav className="sidebar-nav" aria-label="Primary navigation">
            <span className="sidebar-section-label">Workspace</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id && !activeTag;
              return (
                <button
                  key={item.id}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.id)}
                  title={item.hint}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="sidebar-active-chevron" size={14} />}
                </button>
              );
            })}
          </nav>

          {allTags.length > 0 && (
            <div className="sidebar-tag-section">
              <div className="sidebar-section-heading"><span className="sidebar-section-label">Collections</span><span className="sidebar-tag-count">{allTags.length}</span></div>
              <div className="sidebar-tag-list">
                {allTags.map((tag) => {
                  const isActive = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      className={`sidebar-link sidebar-tag-link ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTag(isActive ? null : tag);
                        setActiveView('dashboard');
                        onCloseMobileMenu?.();
                      }}
                    >
                      <Hash size={13} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <nav className="sidebar-nav sidebar-utility-nav" aria-label="Utility navigation">
            <span className="sidebar-section-label">System</span>
            {utilityItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id && !activeTag;
              return (
                <button key={item.id} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="theme-switch" onClick={onThemeToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span className="theme-switch-icon">{theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}</span>
            <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            <span className="theme-switch-state">{theme === 'dark' ? 'On' : 'On'}</span>
          </button>
          <div className="sidebar-user">
            <span className="avatar-badge">{(user?.email || 'U').slice(0, 1).toUpperCase()}</span>
            <span className="sidebar-user-email" title={user?.email}>{user?.email || 'user@example.com'}</span>
            <button className="logout-button" onClick={onLogout} title="Log out" aria-label="Log out"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
