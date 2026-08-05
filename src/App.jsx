import React, { useState, useEffect } from 'react';
import { api, isLoggedIn } from './services/api';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import VocabCard from './components/VocabCard';
import VocabModal from './components/VocabModal';
import RevisionMode from './components/RevisionMode';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import { AlertTriangle, BookOpen } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);
  
  // Navigation & Filtering States
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'favorites', 'recent', 'revision', 'settings', 'about'
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // View & Sorting Preferences
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('vocab_vault_view_mode') || 'card');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'alpha'
  
  // Interactive UI States
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [draftCard, setDraftCard] = useState(false);
  const [confirmDeleteVocab, setConfirmDeleteVocab] = useState(null);
  
  // Loading & App Initialization States
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 1. Initial Auth Check on Mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoggedIn()) {
        try {
          // Fetch vocabularies to verify the token is valid
          const data = await api.getVocabularies();
          setVocabularies(data);
          
          // Recreate a light user object from storage
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

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('vocab_vault_view_mode', viewMode);
  }, [viewMode]);

  // 2. Fetch vocabularies function
  const fetchVocabularies = async () => {
    if (!isLoggedIn()) return;
    setLoading(true);
    try {
      const data = await api.getVocabularies();
      setVocabularies(data);
    } catch (err) {
      console.error('Failed to fetch vocabularies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    fetchVocabularies();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setVocabularies([]);
    setActiveView('dashboard');
    setActiveTag(null);
    setSearchQuery('');
  };

  // 3. Floating Add Button Action
  const handleAddClick = () => {
    setActiveView('dashboard');
    setActiveTag(null);
    setSearchQuery('');
    setDraftCard(true); // Inserts blank draft card at grid index 0
  };

  // 4. API Event: Save Draft Word
  const handleSaveDraft = async (newWordData) => {
    try {
      const saved = await api.createVocabulary(newWordData);
      setVocabularies([saved, ...vocabularies]); // Add to the front of the local list
      setDraftCard(false);
    } catch (err) {
      alert(err.message || 'Failed to save vocabulary word.');
    }
  };

  // 5. API Event: Toggle Favorite
  const handleToggleFavorite = async (vocab) => {
    try {
      const updated = await api.updateVocabulary(vocab.id, {
        ...vocab,
        is_favorite: !vocab.is_favorite
      });
      // Replace in local state list
      setVocabularies(vocabularies.map(v => v.id === vocab.id ? updated : v));
    } catch (err) {
      console.error('Failed to toggle favorite status:', err);
    }
  };

  // 6. API Event: Duplicate Card
  const handleDuplicate = async (vocab) => {
    try {
      const duplicated = await api.duplicateVocabulary(vocab.id);
      setVocabularies([duplicated, ...vocabularies]);
    } catch (err) {
      alert('Failed to duplicate card.');
    }
  };

  // 7. API Event: Delete Confirmation Flow
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteVocab) return;
    try {
      await api.deleteVocabulary(confirmDeleteVocab.id);
      setVocabularies(vocabularies.filter(v => v.id !== confirmDeleteVocab.id));
      setConfirmDeleteVocab(null);
      setSelectedVocab(null); // Close the detail modal too if open
    } catch (err) {
      alert('Failed to delete vocabulary card.');
    }
  };

  // 8. API Event: Save Card updates inside Modal
  const handleSaveModal = async (id, updatedData) => {
    try {
      const saved = await api.updateVocabulary(id, updatedData);
      setVocabularies(vocabularies.map(v => v.id === id ? saved : v));
      setSelectedVocab(null);
    } catch (err) {
      alert(err.message || 'Failed to save vocabulary updates.');
    }
  };

  // 9. Client-side Instant Filter Logic
  const filteredVocabularies = React.useMemo(() => {
    let result = [...vocabularies];

    // Sidebar View filters
    if (activeView === 'favorites') {
      result = result.filter(v => v.is_favorite);
    } else if (activeView === 'recent') {
      // Return 15 latest words
      result = result.slice(0, 15);
    }

    // Sidebar Custom Tag filter
    if (activeTag) {
      result = result.filter(v => v.tags && v.tags.includes(activeTag));
    }

    // Search bar live filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(v => {
        const wordMatch = v.word?.toLowerCase().includes(query);
        const meaningMatch = v.meaning?.toLowerCase().includes(query);
        const notesMatch = v.notes?.toLowerCase().includes(query);
        
        const synonymMatch = v.synonyms && v.synonyms.some(syn => 
          syn.toLowerCase().includes(query)
        );
        const tagMatch = v.tags && v.tags.some(tag => 
          tag.toLowerCase().includes(query)
        );

        return wordMatch || meaningMatch || notesMatch || synonymMatch || tagMatch;
      });
    }

    // Apply client-side sorting
    if (sortBy === 'alpha') {
      result.sort((a, b) => (a.word || '').localeCompare(b.word || ''));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [vocabularies, activeView, activeTag, searchQuery, sortBy]);

  if (!initialized) {
    return (
      <div className="auth-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <BookOpen className="sidebar-logo-icon" size={32} style={{ animation: 'pulse 1.5s infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading Vault...</span>
        </div>
      </div>
    );
  }

  // Render Authentication screen if user is logged out
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const isListView = activeView === 'dashboard' || activeView === 'favorites' || activeView === 'recent';

  return (
    <div className="app-container">
      {/* 1. Sidebar Nav */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        activeTag={activeTag} 
        setActiveTag={setActiveTag}
        vocabularies={vocabularies}
        user={user}
        onLogout={handleLogout}
      />

      {/* 2. Content Area */}
      <main className="app-content">
        {/* Top Header & Search bar */}
        <Navbar 
          activeView={activeView}
          activeTag={activeTag}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddClick={handleAddClick}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Dynamic Views rendering */}
        {isListView && (
          viewMode === 'list' ? (
            <div className="vocab-list">
              {/* Show inline blank draft row at the beginning of the list */}
              {draftCard && (
                <VocabCard 
                  isDraft={true} 
                  viewMode="list"
                  onSaveDraft={handleSaveDraft} 
                  onCancelDraft={() => setDraftCard(false)} 
                />
              )}

              {filteredVocabularies.map((vocab) => (
                <VocabCard
                  key={vocab.id}
                  vocab={vocab}
                  isDraft={false}
                  viewMode="list"
                  onCardClick={setSelectedVocab}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicate}
                  onDeleteClick={setConfirmDeleteVocab}
                />
              ))}

              {/* Empty States */}
              {filteredVocabularies.length === 0 && !draftCard && (
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
              {/* Show inline blank draft card at the beginning of the grid */}
              {draftCard && (
                <VocabCard 
                  isDraft={true} 
                  viewMode="card"
                  onSaveDraft={handleSaveDraft} 
                  onCancelDraft={() => setDraftCard(false)} 
                />
              )}

              {filteredVocabularies.map((vocab) => (
                <VocabCard
                  key={vocab.id}
                  vocab={vocab}
                  isDraft={false}
                  viewMode="card"
                  onCardClick={setSelectedVocab}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicate}
                  onDeleteClick={setConfirmDeleteVocab}
                />
              ))}

              {/* Empty States */}
              {filteredVocabularies.length === 0 && !draftCard && (
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
          <RevisionMode vocabularies={filteredVocabularies} />
        )}

        {activeView === 'settings' && (
          <SettingsView vocabularies={vocabularies} user={user} />
        )}

        {activeView === 'about' && (
          <AboutView />
        )}
      </main>

      {/* 3. Detail edit Modal */}
      {selectedVocab && (
        <VocabModal 
          vocab={selectedVocab}
          onClose={() => setSelectedVocab(null)}
          onSave={handleSaveModal}
          onDelete={setConfirmDeleteVocab}
        />
      )}

      {/* 4. Delete Confirmation Dialog Overlay */}
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
              <button 
                className="confirm-btn cancel" 
                onClick={() => setConfirmDeleteVocab(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn delete" 
                onClick={handleDeleteConfirm}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
