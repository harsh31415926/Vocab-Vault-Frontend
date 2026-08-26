import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, Sparkles } from 'lucide-react';

const createEmptyEntry = () => ({
  word: '',
  meaning: '',
  synonyms: '',
  notes: '',
  tags: '',
});

const parseList = (value) => value
  .split(/[,;\n]/)
  .map((item) => item.trim())
  .filter(Boolean);

export default function BulkAddModal({ isOpen, onClose, onSave, isSaving = false }) {
  const [entries, setEntries] = useState([createEmptyEntry()]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setEntries([createEmptyEntry()]);
    setErrors({});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const updateEntry = (index, field, value) => {
    setEntries((current) => current.map((entry, entryIndex) => (
      entryIndex === index ? { ...entry, [field]: value } : entry
    )));
    setErrors((current) => {
      if (!current[index]) return current;
      const next = { ...current };
      delete next[index];
      return next;
    });
  };

  const addEntry = () => {
    setEntries((current) => [...current, createEmptyEntry()]);
  };

  const removeEntry = (index) => {
    setEntries((current) => current.filter((_, entryIndex) => entryIndex !== index));
    setErrors((current) => {
      const next = {};
      Object.entries(current).forEach(([key, value]) => {
        const numericKey = Number(key);
        if (numericKey < index) next[numericKey] = value;
        if (numericKey > index) next[numericKey - 1] = value;
      });
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const preparedEntries = [];

    entries.forEach((entry, index) => {
      const hasInput = Object.values(entry).some((value) => value.trim());
      if (!hasInput) return;

      const word = entry.word.trim();
      const meaning = entry.meaning.trim();
      if (!word || !meaning) {
        nextErrors[index] = 'Add both a word and a meaning to save this entry.';
        return;
      }

      preparedEntries.push({
        word,
        meaning,
        synonyms: parseList(entry.synonyms),
        examples: [],
        tags: parseList(entry.tags).map((tag) => tag.toLowerCase()),
        notes: entry.notes.trim(),
        is_favorite: false,
      });
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!preparedEntries.length) {
      setErrors({ 0: 'Add at least one vocabulary entry before saving.' });
      return;
    }

    setErrors({});
    await onSave(preparedEntries);
  };

  return (
    <div className="modal-backdrop bulk-add-backdrop" onClick={() => !isSaving && onClose()}>
      <form className="modal-content bulk-add-modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header bulk-add-header">
          <div>
            <span className="header-eyebrow">Batch capture</span>
            <h2 className="modal-title">Add multiple words</h2>
            <p className="bulk-add-subtitle">Build a small set of entries in one focused pass.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} disabled={isSaving} aria-label="Close bulk add modal">
            <X size={20} />
          </button>
        </div>

        <div className="bulk-add-body">
          <div className="bulk-add-hint">
            <Sparkles size={15} />
            <span>Synonyms and tags can be separated with commas or semicolons.</span>
          </div>

          <div className="bulk-entry-list">
            {entries.map((entry, index) => (
              <div className="bulk-entry-card" key={index}>
                <div className="bulk-entry-heading">
                  <div>
                    <span className="bulk-entry-index">Entry {String(index + 1).padStart(2, '0')}</span>
                    <span className="bulk-entry-status">{entry.word.trim() || 'Untitled entry'}</span>
                  </div>
                  {entries.length > 1 && (
                    <button type="button" className="bulk-remove-btn" onClick={() => removeEntry(index)} disabled={isSaving}>
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="bulk-entry-fields">
                  <label className="bulk-field bulk-field-word">
                    <span>Word <em>*</em></span>
                    <input
                      className="modal-input-field"
                      value={entry.word}
                      onChange={(event) => updateEntry(index, 'word', event.target.value)}
                      placeholder="e.g. Perspicacious"
                      autoFocus={index === 0}
                    />
                  </label>
                  <label className="bulk-field bulk-field-meaning">
                    <span>Meaning <em>*</em></span>
                    <textarea
                      className="modal-textarea-field"
                      value={entry.meaning}
                      onChange={(event) => updateEntry(index, 'meaning', event.target.value)}
                      placeholder="A clear, concise definition"
                      rows={2}
                    />
                  </label>
                  <label className="bulk-field">
                    <span>Synonyms</span>
                    <input
                      className="modal-input-field"
                      value={entry.synonyms}
                      onChange={(event) => updateEntry(index, 'synonyms', event.target.value)}
                      placeholder="astute; perceptive"
                    />
                  </label>
                  <label className="bulk-field">
                    <span>Tags</span>
                    <input
                      className="modal-input-field"
                      value={entry.tags}
                      onChange={(event) => updateEntry(index, 'tags', event.target.value)}
                      placeholder="reading, work"
                    />
                  </label>
                  <label className="bulk-field bulk-field-notes">
                    <span>Notes</span>
                    <textarea
                      className="modal-textarea-field"
                      value={entry.notes}
                      onChange={(event) => updateEntry(index, 'notes', event.target.value)}
                      placeholder="A memory cue, context, or personal note"
                      rows={2}
                    />
                  </label>
                </div>

                {errors[index] && <p className="bulk-entry-error" role="alert">{errors[index]}</p>}
              </div>
            ))}
          </div>

          <button type="button" className="bulk-add-row-btn" onClick={addEntry} disabled={isSaving}>
            <Plus size={16} />
            Add another entry
          </button>
        </div>

        <div className="modal-footer bulk-add-footer">
          <span className="bulk-add-count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'} ready to shape</span>
          <div className="modal-actions-right">
            <button type="button" className="draft-btn cancel" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="modal-save-btn bulk-save-btn" disabled={isSaving}>
              {isSaving ? <><span className="button-spinner" /> Saving…</> : <><Save size={15} /> Save all entries</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
