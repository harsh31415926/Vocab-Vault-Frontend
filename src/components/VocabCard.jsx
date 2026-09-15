import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Copy, Check, MoreVertical } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

export default function VocabCard({ 
  vocab, 
  index, 
  onCardClick, 
  onDeleteClick, 
  onToggleFavorite, 
  onDuplicate,
  isSelected,
  isSelectionMode,
  onToggleSelection,
  isRemoving,
  viewMode = 'grid',
  isDraft = false,
  onSaveDraft,
  onCancelDraft,
}) {
  const cardRef = useRef(null);
  const wordInputRef = useRef(null);
  
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (isDraft && wordInputRef.current) {
      wordInputRef.current.focus();
    }
  }, [isDraft]);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!word.trim() || !meaning.trim()) return;
    setIsSaving(true);
    await onSaveDraft({ word: word.trim(), meaning: meaning.trim() });
    setIsSaving(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    onCancelDraft();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  if (isDraft) {
    if (viewMode === 'list') {
      return (
        <div className="premium-list-card draft-mode" onClick={(e) => e.stopPropagation()}>
          <div className="premium-draft-inputs">
            <input
              type="text"
              ref={wordInputRef}
              placeholder="Word..."
              className="premium-draft-input word-input"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
            <input
              type="text"
              placeholder="Meaning..."
              className="premium-draft-input meaning-input"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </div>
          <div className="premium-draft-actions">
            <button className="premium-draft-btn cancel" onClick={handleCancel}>Discard</button>
            <button 
              className="premium-draft-btn save" 
              onClick={handleSave}
              disabled={isSaving || !word.trim() || !meaning.trim()}
              style={{ opacity: (isSaving || !word.trim() || !meaning.trim()) ? 0.5 : 1 }}
            >
              {isSaving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="premium-vocab-card draft-mode" onClick={(e) => e.stopPropagation()}>
        <div className="premium-draft-inputs-col">
          <input
            type="text"
            ref={wordInputRef}
            placeholder="Enter word..."
            className="premium-draft-input word-input"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <textarea
            placeholder="Enter meaning..."
            className="premium-draft-input meaning-input"
            style={{ resize: 'none', minHeight: '60px' }}
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
          />
        </div>
        <div className="premium-draft-actions">
          <button className="premium-draft-btn cancel" onClick={handleCancel}>Discard</button>
          <button 
            className="premium-draft-btn save" 
            onClick={handleSave}
            disabled={isSaving || !word.trim() || !meaning.trim()}
            style={{ opacity: (isSaving || !word.trim() || !meaning.trim()) ? 0.5 : 1 }}
          >
            {isSaving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    );
  }

  const enter = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.42, delay: Math.min(index, 18) * 0.045, ease: [0.16, 1, 0.3, 1] },
  };

  const handleOptionsClick = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // Click outside to close options
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showOptions) setShowOptions(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptions]);

  if (viewMode === 'list') {
    return (
      <motion.div 
        {...enter} 
        ref={cardRef}
        className={`premium-list-card ${isSelected ? 'is-selected' : ''} ${isRemoving ? 'is-removing' : ''}`} 
        onClick={() => onCardClick(vocab)}
        whileHover={{ x: 4, backgroundColor: 'var(--bg-card-hover)' }}
      >
        <div className="premium-list-left">
          {isSelectionMode && (
            <button
              type="button"
              className={`premium-select-control ${isSelected ? 'selected' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                onToggleSelection(vocab);
              }}
            >
              {isSelected && <Check size={13} strokeWidth={2.5} />}
            </button>
          )}
          <FavoriteButton
            isFavorite={!!vocab.is_favorite}
            onToggle={() => onToggleFavorite(vocab)}
            size={16}
            className="premium-list-fav"
          />
          <span className="premium-list-word">{vocab.word}</span>
          <span className="premium-list-divider" />
          <span className="premium-list-meaning">{vocab.meaning}</span>
        </div>

        <div className="premium-list-right" onClick={(e) => e.stopPropagation()}>
          <div className="premium-list-tags">
            {vocab.tags && vocab.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="premium-tag">{tag}</span>
            ))}
          </div>
          <span className="premium-list-date">{formatDate(vocab.created_at)}</span>
          
          <div className="premium-options-wrapper">
            <button className="premium-options-trigger" onClick={handleOptionsClick}>
              <MoreVertical size={16} />
            </button>
            {showOptions && (
              <div className="premium-options-menu">
                <button onClick={() => onDuplicate(vocab)}><Copy size={14}/> Duplicate</button>
                <button onClick={() => onDeleteClick(vocab)} className="danger"><Trash2 size={14}/> Delete</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      {...enter} 
      ref={cardRef}
      className={`premium-vocab-card ${isSelected ? 'is-selected' : ''} ${isRemoving ? 'is-removing' : ''}`} 
      onClick={() => onCardClick(vocab)}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="premium-vocab-header">
        <div className="premium-vocab-word-group">
          {isSelectionMode && (
            <button
              type="button"
              className={`premium-select-control ${isSelected ? 'selected' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                onToggleSelection(vocab);
              }}
            >
              {isSelected && <Check size={13} strokeWidth={2.5} />}
            </button>
          )}
          <h3 className="premium-vocab-word">{vocab.word}</h3>
        </div>
        
        <div className="premium-vocab-actions" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton
            isFavorite={!!vocab.is_favorite}
            onToggle={() => onToggleFavorite(vocab)}
            size={18}
          />
          <div className="premium-options-wrapper">
            <button className="premium-options-trigger" onClick={handleOptionsClick}>
              <MoreVertical size={18} />
            </button>
            {showOptions && (
              <div className="premium-options-menu">
                <button onClick={() => onDuplicate(vocab)}><Copy size={14}/> Duplicate</button>
                <button onClick={() => onDeleteClick(vocab)} className="danger"><Trash2 size={14}/> Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="premium-vocab-meaning">{vocab.meaning}</p>

      <div className="premium-vocab-footer">
        <div className="premium-vocab-tags">
          {vocab.tags && vocab.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="premium-tag">{tag}</span>
          ))}
          {vocab.tags && vocab.tags.length > 3 && (
            <span className="premium-tag extra">+{vocab.tags.length - 3}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
