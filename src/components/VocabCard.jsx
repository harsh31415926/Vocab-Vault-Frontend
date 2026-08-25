import React, { useState, useEffect, useRef } from 'react';
import { Star, Copy, Trash2 } from 'lucide-react';

export default function VocabCard({ 
  vocab, 
  isDraft, 
  onSaveDraft, 
  onCancelDraft, 
  onCardClick, 
  onToggleFavorite, 
  onDuplicate, 
  onDeleteClick,
  viewMode = 'card'
}) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const wordInputRef = useRef(null);

  // Focus the word input field when draft card is generated
  useEffect(() => {
    if (isDraft && wordInputRef.current) {
      wordInputRef.current.focus();
    }
  }, [isDraft]);

  const handleSave = (e) => {
    e.stopPropagation();
    if (!word.trim() || !meaning.trim()) return;
    onSaveDraft({
      word: word.trim(),
      meaning: meaning.trim(),
      synonyms: [],
      examples: [],
      tags: [],
      notes: '',
      is_favorite: false
    });
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    onCancelDraft();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return '';
    }
  };

  if (isDraft) {
    if (viewMode === 'list') {
      return (
        <div className="vocab-row draft-mode" onClick={(e) => e.stopPropagation()}>
          <div className="vocab-row-inputs">
            <input
              type="text"
              ref={wordInputRef}
              placeholder="Word..."
              className="vocab-row-input word-input"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
            <input
              type="text"
              placeholder="Meaning..."
              className="vocab-row-input meaning-input"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </div>
          <div className="draft-actions" style={{ marginTop: 0 }}>
            <button className="draft-btn cancel" onClick={handleCancel}>
              Discard
            </button>
            <button 
              className="draft-btn save" 
              onClick={handleSave}
              disabled={!word.trim() || !meaning.trim()}
              style={{ opacity: (!word.trim() || !meaning.trim()) ? 0.5 : 1 }}
            >
              Create
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="vocab-card draft-mode" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            ref={wordInputRef}
            placeholder="Enter word..."
            className="vocab-card-input word-input"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <textarea
            placeholder="Enter meaning..."
            className="vocab-card-input"
            style={{ resize: 'none', minHeight: '60px' }}
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
          />
        </div>
        <div className="draft-actions">
          <button className="draft-btn cancel" onClick={handleCancel}>
            Discard
          </button>
          <button 
            className="draft-btn save" 
            onClick={handleSave}
            disabled={!word.trim() || !meaning.trim()}
            style={{ opacity: (!word.trim() || !meaning.trim()) ? 0.5 : 1 }}
          >
            Create
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="vocab-row" onClick={() => onCardClick(vocab)}>
        <div className="vocab-row-left">
          <button 
            className={`row-favorite-btn ${vocab.is_favorite ? 'favorite' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(vocab);
            }}
            title={vocab.is_favorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star size={14} fill={vocab.is_favorite ? 'var(--favorite-color)' : 'none'} />
          </button>
          
          <span className="vocab-row-word">{vocab.word}</span>
          <span className="vocab-row-divider">•</span>
          <span className="vocab-row-meaning" title={vocab.meaning}>
            {vocab.meaning}
          </span>
        </div>

        <div className="vocab-row-right" onClick={(e) => e.stopPropagation()}>
          {vocab.notes && (
            <span className="vocab-row-notes-indicator" title="Has personal notes">
              📝
            </span>
          )}

          <div className="vocab-row-tags">
            {vocab.tags && vocab.tags.slice(0, 1).map((tag, idx) => (
              <span key={idx} className="tag-badge" style={{ fontSize: '10px', padding: '1px 6px' }}>{tag}</span>
            ))}
          </div>

          <span className="vocab-row-date">
            {formatDate(vocab.created_at)}
          </span>

          <div className="vocab-row-actions">
            <button 
              className="card-action-btn"
              onClick={() => onDuplicate(vocab)}
              title="Duplicate Word"
            >
              <Copy size={13} />
            </button>
            <button 
              className="card-action-btn"
              onClick={() => onDeleteClick(vocab)}
              title="Delete Word"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vocab-card" onClick={() => onCardClick(vocab)}>
      <div className="vocab-card-header">
        <h3 className="vocab-card-word">{vocab.word}</h3>
        <div className="vocab-card-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`card-action-btn ${vocab.is_favorite ? 'favorite' : ''}`}
            onClick={() => onToggleFavorite(vocab)}
            title={vocab.is_favorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star size={16} fill={vocab.is_favorite ? 'var(--favorite-color)' : 'none'} />
          </button>
          <button 
            className="card-action-btn"
            onClick={() => onDuplicate(vocab)}
            title="Duplicate Word"
          >
            <Copy size={15} />
          </button>
          <button 
            className="card-action-btn"
            onClick={() => onDeleteClick(vocab)}
            title="Delete Word"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className="vocab-card-meaning">{vocab.meaning}</p>

      {vocab.notes && (
        <p className="vocab-card-notes">
          {vocab.notes.length > 90 ? `${vocab.notes.substring(0, 90)}...` : vocab.notes}
        </p>
      )}

      <div className="vocab-card-footer">
        <div className="vocab-card-tags">
          {vocab.tags && vocab.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="tag-badge">{tag}</span>
          ))}
          {vocab.tags && vocab.tags.length > 2 && (
            <span className="tag-badge" style={{ color: 'var(--accent-color)' }}>
              +{vocab.tags.length - 2}
            </span>
          )}
        </div>
        <span className="vocab-card-date">
          {formatDate(vocab.created_at)}
        </span>
      </div>
    </div>
  );
}
