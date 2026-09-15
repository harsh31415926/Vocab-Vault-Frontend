import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Volume2, Calendar, Tag, Play, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import FavoriteButton from './FavoriteButton';

export default function WordDetail({ vocab, onClose, onEdit, onDelete, onToggleFavorite }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (vocab) {
      setIsFavorite(vocab.is_favorite || false);
    }
  }, [vocab]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return '—';
    }
  };

  const handleFavoriteToggle = () => {
    if (onToggleFavorite) onToggleFavorite(vocab);
  };

  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  if (!vocab) return null;

  const hasSynonyms = vocab.synonyms && vocab.synonyms.length > 0;
  const hasExamples = vocab.examples && vocab.examples.length > 0;
  const hasNotes = vocab.notes && vocab.notes.trim();
  const hasTags = vocab.tags && vocab.tags.length > 0;

  // Determine an abstract visual color based on the word length
  const colors = [
    'linear-gradient(135deg, rgba(71, 212, 208, 0.15) 0%, rgba(7, 9, 13, 1) 100%)',
    'linear-gradient(135deg, rgba(71, 212, 208, 0.1) 0%, rgba(14, 19, 24, 1) 100%)',
    'linear-gradient(135deg, rgba(71, 212, 208, 0.2) 0%, rgba(7, 9, 13, 1) 100%)'
  ];
  const abstractColor = colors[vocab.word.length % colors.length];

  return (
    <motion.div 
      className="modal-backdrop premium-backdrop" 
      onClick={onClose} 
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
      animate={{ opacity: 1, backdropFilter: 'blur(12px)' }} 
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="premium-modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="premium-modal-layout">
          {/* Visual Storytelling Sidebar */}
          <div className="premium-modal-sidebar" style={{ background: abstractColor }}>
            <div className="premium-sidebar-graphics">
              <div className="graphic-circle graphic-circle-1" />
              <div className="graphic-circle graphic-circle-2" />
            </div>
            
            <div className="premium-word-hero">
              <motion.h1 
                className="premium-word-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {vocab.word}
              </motion.h1>
              <motion.div 
                className="premium-word-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <button 
                  className="premium-audio-btn" 
                  onClick={() => playAudio(vocab.word)}
                  title="Listen to pronunciation"
                >
                  <Volume2 size={20} />
                </button>
                <span className="premium-pos-badge">word</span>
              </motion.div>
            </div>
            
            <div className="premium-sidebar-footer">
              <div className="premium-date">
                <Calendar size={14} />
                <span>Added {formatDate(vocab.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="premium-modal-content">
            <div className="premium-modal-top-bar">
              <div className="premium-top-actions">
                <FavoriteButton
                  isFavorite={isFavorite}
                  onToggle={handleFavoriteToggle}
                  size={20}
                  className="premium-fav-btn"
                />
                <button className="premium-icon-btn" onClick={onEdit} title="Edit word">
                  <Edit2 size={18} />
                </button>
                {onDelete && (
                  <button className="premium-icon-btn danger" onClick={() => onDelete(vocab)} title="Delete word">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <button className="premium-close-btn" onClick={onClose} aria-label="Close">
                <X size={24} />
              </button>
            </div>

            <div className="premium-scrollable-content">
              {/* Definition */}
              <div className="premium-section">
                <h3 className="premium-section-title">
                  <Sparkles size={16} /> Meaning
                </h3>
                <p className="premium-definition">
                  {vocab.meaning || <span className="premium-empty">No definition provided.</span>}
                </p>
              </div>

              {/* Examples */}
              {hasExamples && (
                <div className="premium-section">
                  <h3 className="premium-section-title">Examples</h3>
                  <div className="premium-examples-list">
                    {vocab.examples.map((ex, idx) => (
                      <div key={idx} className="premium-example-card">
                        <span className="premium-quote-mark">"</span>
                        <p className="premium-example-text">{ex}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Synonyms */}
              {hasSynonyms && (
                <div className="premium-section">
                  <h3 className="premium-section-title">Synonyms</h3>
                  <div className="premium-chips-container">
                    {vocab.synonyms.map((syn, idx) => (
                      <span key={idx} className="premium-chip synonym-chip">{syn}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {hasNotes && (
                <div className="premium-section">
                  <h3 className="premium-section-title">Notes</h3>
                  <div className="premium-notes-card">
                    <BookOpen size={16} className="premium-notes-icon" />
                    <p className="premium-notes-text">{vocab.notes}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {hasTags && (
                <div className="premium-section">
                  <h3 className="premium-section-title">Tags</h3>
                  <div className="premium-chips-container">
                    {vocab.tags.map((tag, idx) => (
                      <span key={idx} className="premium-chip tag-chip">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action Footer */}
            <div className="premium-modal-footer">
              <button className="premium-primary-cta" onClick={onClose}>
                <Play size={16} />
                Practice This Word
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
