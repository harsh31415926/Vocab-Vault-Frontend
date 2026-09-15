import React, { useState, useEffect } from 'react';
import { X, Edit2, Calendar, Tag, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import FavoriteButton from './FavoriteButton';

export default function WordDetail({ vocab, onClose, onEdit, onToggleFavorite }) {
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
    if (onToggleFavorite) {
      onToggleFavorite(vocab);
    }
  };

  if (!vocab) return null;

  return (
    <motion.div 
      className="modal-backdrop" 
      onClick={onClose} 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="modal-content word-detail-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="modal-title">Word Details</span>
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={handleFavoriteToggle}
              size={20}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.button
              className="edit-icon-btn"
              onClick={onEdit}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Edit word"
            >
              <Edit2 size={18} />
            </motion.button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close word details">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="word-detail-hero">
          <motion.p 
            className="word-detail-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {vocab.word || '—'}
          </motion.p>
        </div>

        <div className="modal-body">
          {/* Meaning */}
          <div className="detail-section">
            <div className="detail-section-header">
              <BookOpen size={16} />
              <span className="detail-section-label">Meaning</span>
            </div>
            <p className="detail-content">
              {vocab.meaning || <span className="detail-empty">No meaning provided.</span>}
            </p>
          </div>

          {/* Synonyms */}
          {vocab.synonyms && vocab.synonyms.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-header">
                <Tag size={16} />
                <span className="detail-section-label">Synonyms</span>
              </div>
              <div className="detail-tags">
                {vocab.synonyms.map((syn, idx) => (
                  <span key={idx} className="detail-tag">{syn}</span>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {vocab.examples && vocab.examples.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-header">
                <BookOpen size={16} />
                <span className="detail-section-label">Examples</span>
              </div>
              <div className="detail-examples">
                {vocab.examples.map((ex, idx) => (
                  <p key={idx} className="detail-example">"{ex}"</p>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {vocab.notes && (
            <div className="detail-section">
              <div className="detail-section-header">
                <BookOpen size={16} />
                <span className="detail-section-label">Notes</span>
              </div>
              <p className="detail-content">
                {vocab.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {vocab.tags && vocab.tags.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-header">
                <Tag size={16} />
                <span className="detail-section-label">Tags</span>
              </div>
              <div className="detail-tags">
                {vocab.tags.map((tag, idx) => (
                  <span key={idx} className="detail-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="detail-section detail-metadata">
            <div className="detail-section-header">
              <Calendar size={16} />
              <span className="detail-section-label">Created</span>
            </div>
            <p className="detail-content">
              {formatDate(vocab.created_at)}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}