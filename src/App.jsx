import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api, isLoggedIn } from './services/api';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import VocabCard from './components/VocabCard';
import VocabModal from './components/VocabModal';
import DashboardInsights from './components/DashboardInsights';
import RevisionMode from './components/RevisionMode';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import AnimatedBackground from './components/AnimatedBackground';
import ToastNotification from './components/ToastNotification';
import CommandPalette from './components/CommandPalette';
import StatsBar from './components/StatsBar';
import { AlertTriangle, BookOpen } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);

  // Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vocab_vault_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Navigation & Filtering States
  const [activeView, setActiveView] = useState('dashboard');
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // View & Sorting Preferences
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('vocab_vault_view_mode') || 'card');
  const [sortBy, setSortBy] = useState('recent');

  // Interactive UI States
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [draftCard, setDraftCard] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [confirmDeleteVocab, setConfirmDeleteVocab] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedVocabIds, setSelectedVocabIds] = useState([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [removingVocabIds, setRemovingVocabIds] = useState([]);

  // New UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [quickRevision, setQuickRevision] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Loading & App Initialization States
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('vocab_vault_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Initial Auth Check on Mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoggedIn()) {
        try {
          const data = await api.getVocabularies();
          setVocabularies(data);

          const token = localStorage.getItem('vocab_vault_token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ id: payload.userId, email: payload.email });
          }
        } catch (err) {
          console.error('Invalid saved token:', err);
          api.logout();
          setUser(null);
        }
      }
      setInitialized(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem('vocab_vault_view_mode', viewMode);
  }, [viewMode]);

  const fetchVocabularies = async () => {
    if (!isLoggedIn()) return;
    setLoading(true);
    try {
      const data = await api.getVocabularies();
      setVocabularies(data);
    } catch (err) {
      console.error('Failed to fetch vocabularies:', err);
      addToast('Failed to fetch vocabularies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    fetchVocabularies();
    addToast('Successfully authenticated', 'success');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setVocabularies([]);
    setActiveView('dashboard');
    setActiveTag(null);
    setSearchQuery('');
    addToast('Logged out successfully', 'info');
  };

  const handleAddClick = () => {
    setActiveView('dashboard');
    setActiveTag(null);
    setSearchQuery('');
    setDraftCard(true);
  };

  const handleEnterSelection = () => {
    setIsSelectionMode(true);
    setSelectedVocabIds([]);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedVocabIds([]);
    setConfirmBulkDelete(false);
  };

  const handleToggleSelection = (vocab) => {
    setSelectedVocabIds((current) => (
      current.includes(vocab.id)
        ? current.filter((id) => id !== vocab.id)
        : [...current, vocab.id]
    ));
  };

  const handleToggleSelectAllVisible = () => {
    setSelectedVocabIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleVocabIds.includes(id));
      return [...new Set([...current, ...visibleVocabIds])];
    });
  };

  const handleBulkDeleteConfirm = async () => {
    if (!selectedVocabIds.length) return;
    setIsBulkDeleting(true);
    try {
      const idsToDelete = [...selectedVocabIds];
      const result = await api.deleteVocabularies(idsToDelete);
      const idsToDeleteSet = new Set(idsToDelete);
      setRemovingVocabIds(idsToDelete);
      setConfirmBulkDelete(false);
      setIsSelectionMode(false);
      setSelectedVocabIds([]);
      window.setTimeout(() => {
        setVocabularies((current) => current.filter((vocab) => !idsToDeleteSet.has(vocab.id)));
        setRemovingVocabIds((current) => current.filter((id) => !idsToDeleteSet.has(id)));
      }, 180);
      addToast(`${result.deletedCount ?? idsToDelete.length} ${result.deletedCount === 1 ? 'entry' : 'entries'} deleted`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete selected entries.', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCardClick = (vocab) => {
    if (isSelectionMode) {
      handleToggleSelection(vocab);
      return;
    }
    setSelectedVocab(vocab);
  };

  const handleSaveDraft = async (newWordData) => {
    setIsDraftSaving(true);
    try {
      const saved = await api.createVocabulary(newWordData);
      setVocabularies((current) => [saved, ...current]);
      setDraftCard(false);
      addToast('Vocabulary word created', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save vocabulary word.', 'error');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleImportVocabulary = async (entries) => {
    if (!entries.length) return;
    setLoading(true);
    try {
      const imported = [];
      for (const entry of entries) {
        imported.push(await api.createVocabulary(entry));
      }
      setVocabularies((current) => [...imported, ...current]);
      addToast(`${imported.length} ${imported.length === 1 ? 'entry' : 'entries'} imported`, 'success');
    } catch (err) {
      addToast(err.message || 'Import stopped before all entries were saved.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (vocab) => {
    try {
      const updated = await api.updateVocabulary(vocab.id, {
        ...vocab,
        is_favorite: !vocab.is_favorite
      });
      setVocabularies((current) => current.map(v => v.id === vocab.id ? updated : v));
      addToast(updated.is_favorite ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch {
      addToast('Failed to toggle favorite status', 'error');
    }
  };

  const handleDuplicate = async (vocab) => {
    try {
      const duplicated = await api.duplicateVocabulary(vocab.id);
      setVocabularies((current) => [duplicated, ...current]);
      addToast('Vocabulary duplicated', 'success');
    } catch {
      addToast('Failed to duplicate card', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteVocab) return;
    try {
      const idToDelete = confirmDeleteVocab.id;
      await api.deleteVocabulary(idToDelete);
      setRemovingVocabIds((current) => [...new Set([...current, idToDelete])]);
      setSelectedVocabIds((current) => current.filter((id) => id !== idToDelete));
      setConfirmDeleteVocab(null);
      setSelectedVocab(null);
      window.setTimeout(() => {
        setVocabularies((current) => current.filter((vocab) => vocab.id !== idToDelete));
        setRemovingVocabIds((current) => current.filter((id) => id !== idToDelete));
      }, 180);
      addToast('Vocabulary deleted permanently', 'success');
    } catch {
      addToast('Failed to delete vocabulary card.', 'error');
    }
  };

  const handleSaveModal = async (id, updatedData) => {
    try {
      const saved = await api.updateVocabulary(id, updatedData);
      setVocabularies((current) => current.map(v => v.id === id ? saved : v));
      setSelectedVocab(null);
      addToast('Vocabulary changes saved', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save vocabulary updates.', 'error');
    }
  };

  const filteredVocabularies = React.useMemo(() => {
    let result = [...vocabularies];

    if (activeView === 'favorites') {
      result = result.filter(v => v.is_favorite);
    } else if (activeView === 'recent') {
      result = result.slice(0, 15);
    }

    if (activeTag) {
      result = result.filter(v => v.tags && v.tags.includes(activeTag));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(v => {
        const wordMatch = v.word?.toLowerCase().includes(query);
        const meaningMatch = v.meaning?.toLowerCase().includes(query);
        const notesMatch = v.notes?.toLowerCase().includes(query);
        const synonymMatch = v.synonyms && v.synonyms.some(syn => syn.toLowerCase().includes(query));
        const tagMatch = v.tags && v.tags.some(tag => tag.toLowerCase().includes(query));
        return wordMatch || meaningMatch || notesMatch || synonymMatch || tagMatch;
      });
    }

    if (sortBy === 'alpha') {
      result.sort((a, b) => (a.word || '').localeCompare(b.word || ''));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [vocabularies, activeView, activeTag, searchQuery, sortBy]);

  const visibleVocabIds = filteredVocabularies.map((vocab) => vocab.id);
  const allVisibleSelected = visibleVocabIds.length > 0 && visibleVocabIds.every((id) => selectedVocabIds.includes(id));

  if (!initialized) {
    return (
      <div className="auth-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 10 }}>
          <BookOpen className="sidebar-logo-icon" size={32} style={{ animation: 'pulse 1.5s infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading Vault...</span>
        </div>
        <AnimatedBackground theme="dark" />
      </div>
    );
  }

  // Render Authentication screen if user is logged out
  if (!user) {
    return (
      <>
        <AnimatedBackground theme={theme} />
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  const isListView = activeView === 'dashboard' || activeView === 'favorites' || activeView === 'recent';

  return (
    <motion.div className="app-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
      <AnimatedBackground theme={theme} />

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        vocabularies={vocabularies}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={toggleTheme}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      <main className="app-content">
        <Navbar
          activeView={activeView}
          activeTag={activeTag}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddClick={handleAddClick}
          isSelectionMode={isSelectionMode}
          onEnterSelection={handleEnterSelection}
          onCancelSelection={handleCancelSelection}
          selectedCount={selectedVocabIds.length}
          visibleCount={visibleVocabIds.length}
          allVisibleSelected={allVisibleSelected}
          onToggleSelectAllVisible={handleToggleSelectAllVisible}
          onBulkDeleteClick={() => setConfirmBulkDelete(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          vocabularyCount={filteredVocabularies.length}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {activeView === 'dashboard' && (
          <DashboardInsights
            vocabularies={vocabularies}
            user={user}
            onOpenWord={setSelectedVocab}
            onQuickRevision={() => { setQuickRevision(true); setActiveView('revision'); }}
          />
        )}

        {isListView && (
          <div style={{ marginBottom: '8px' }}>
            <StatsBar vocabularies={filteredVocabularies} />
          </div>
        )}

        {isListView && loading && (
          <div className="loading-state" role="status">
            <div className="loading-line loading-line-wide" />
            <div className="loading-line" />
            <div className="loading-line loading-line-short" />
            <span>Syncing your vocabulary vault…</span>
          </div>
        )}

        {isListView && (
          viewMode === 'list' ? (
            <div className="vocab-list">
              {draftCard && (
                <VocabCard
                  isDraft={true}
                  viewMode="list"
                  onSaveDraft={handleSaveDraft}
                  onCancelDraft={() => setDraftCard(false)}
                  isSaving={isDraftSaving}
                />
              )}

              {filteredVocabularies.map((vocab) => (
                <VocabCard
                  key={vocab.id}
                  vocab={vocab}
                  isDraft={false}
                  viewMode="list"
                  onCardClick={handleCardClick}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedVocabIds.includes(vocab.id)}
                  isRemoving={removingVocabIds.includes(vocab.id)}
                  onToggleSelection={handleToggleSelection}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicate}
                  onDeleteClick={setConfirmDeleteVocab}
                />
              ))}

              {filteredVocabularies.length === 0 && !draftCard && !loading && (
                <div className="empty-state" style={{ border: 'none', background: 'transparent', padding: '40px 24px' }}>
                  <h3 className="empty-state-title">No Vocabulary Found</h3>
                  <p className="empty-state-desc">
                    {searchQuery
                      ? 'No cards in your vault match the active search parameters.'
                      : activeTag
                      ? `No vocabulary cards contain the tag #${activeTag}.`
                      : activeView === 'favorites'
                      ? "You haven't marked any vocabulary entries as favorites yet."
                      : 'Your vocabulary vault is empty. Begin recording new words now.'}
                  </p>
                  {!searchQuery && (
                    <button className="empty-state-btn" onClick={handleAddClick}>
                      Record First Word
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="vocab-grid">
              {draftCard && (
                <VocabCard
                  isDraft={true}
                  viewMode="card"
                  onSaveDraft={handleSaveDraft}
                  onCancelDraft={() => setDraftCard(false)}
                  isSaving={isDraftSaving}
                />
              )}

              {filteredVocabularies.map((vocab) => (
                <VocabCard
                  key={vocab.id}
                  vocab={vocab}
                  isDraft={false}
                  viewMode="card"
                  onCardClick={handleCardClick}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedVocabIds.includes(vocab.id)}
                  isRemoving={removingVocabIds.includes(vocab.id)}
                  onToggleSelection={handleToggleSelection}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicate}
                  onDeleteClick={setConfirmDeleteVocab}
                />
              ))}

              {filteredVocabularies.length === 0 && !draftCard && !loading && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state">
                    <h3 className="empty-state-title">No Vocabulary Found</h3>
                    <p className="empty-state-desc">
                      {searchQuery
                        ? 'No cards in your vault match the active search parameters.'
                        : activeTag
                        ? `No vocabulary cards contain the tag #${activeTag}.`
                        : activeView === 'favorites'
                        ? "You haven't marked any vocabulary entries as favorites yet."
                        : 'Your vocabulary vault is empty. Begin recording new words now.'}
                    </p>
                    {!searchQuery && (
                      <button className="empty-state-btn" onClick={handleAddClick}>
                        Record First Word
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {activeView === 'revision' && (
          <RevisionMode vocabularies={filteredVocabularies} quickStart={quickRevision} userId={user?.id || user?.email} />
        )}

        {activeView === 'settings' && (
          <SettingsView vocabularies={vocabularies} user={user} onImportVocabulary={handleImportVocabulary} />
        )}

        {activeView === 'about' && (
          <AboutView />
        )}
      </main>

      {/* Modals & Overlays */}
      {selectedVocab && (
        <VocabModal
          vocab={selectedVocab}
          onClose={() => setSelectedVocab(null)}
          onSave={handleSaveModal}
          onDelete={setConfirmDeleteVocab}
        />
      )}

      {confirmDeleteVocab && (
        <div className="modal-backdrop" onClick={() => setConfirmDeleteVocab(null)} style={{ zIndex: 1100 }}>
          <div className="modal-content confirm-dialog-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={36} style={{ color: 'var(--danger-color)' }} />
              <h3 className="modal-title" style={{ fontSize: '18px' }}>Remove Word</h3>
            </div>
            <p className="about-text" style={{ fontSize: '14px' }}>
              Are you sure you want to permanently delete <strong>"{confirmDeleteVocab.word}"</strong> from your vocabulary vault? This action cannot be undone.
            </p>
            <div className="confirm-dialog-buttons">
              <button className="confirm-btn cancel" onClick={() => setConfirmDeleteVocab(null)}>
                Cancel
              </button>
              <button className="confirm-btn delete" onClick={handleDeleteConfirm}>
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmBulkDelete && (
        <div className="modal-backdrop" onClick={() => !isBulkDeleting && setConfirmBulkDelete(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content confirm-dialog-content bulk-delete-confirm" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={36} style={{ color: 'var(--danger-color)' }} />
              <h3 className="modal-title" style={{ fontSize: '18px' }}>Delete {selectedVocabIds.length} {selectedVocabIds.length === 1 ? 'entry' : 'entries'}?</h3>
            </div>
            <p className="about-text" style={{ fontSize: '14px' }}>
              These selected vocabulary entries will be permanently removed from your vault. This action cannot be undone.
            </p>
            <div className="confirm-dialog-buttons">
              <button className="confirm-btn cancel" onClick={() => setConfirmBulkDelete(false)} disabled={isBulkDeleting}>Cancel</button>
              <button className="confirm-btn delete" onClick={handleBulkDeleteConfirm} disabled={isBulkDeleting}>
                {isBulkDeleting ? <><span className="button-spinner" /> Deleting…</> : <>Delete {selectedVocabIds.length} {selectedVocabIds.length === 1 ? 'entry' : 'entries'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        vocabularies={vocabularies}
        onSelectVocab={(vocab) => {
          setSelectedVocab(vocab);
          setIsCommandPaletteOpen(false);
        }}
        onNavigate={(viewId) => {
          setActiveView(viewId);
          setActiveTag(null);
        }}
      />

      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </motion.div>
  );
}
