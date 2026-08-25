import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Clock3, Command, Layers, Search, Settings, Star, X } from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Open dashboard', icon: BookOpen },
  { id: 'favorites', label: 'Open favorites', icon: Star },
  { id: 'recent', label: 'Open recently added', icon: Clock3 },
  { id: 'revision', label: 'Start revision mode', icon: Layers },
  { id: 'settings', label: 'Open settings', icon: Settings },
];

export default function CommandPalette({ isOpen, onClose, vocabularies, onSelectVocab, onNavigate }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef([]);

  useEffect(() => {
    if (!isOpen) return undefined;
    setQuery('');
    setActiveIndex(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, Math.max(resultsRef.current.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === 'Enter' && resultsRef.current[activeIndex]) {
        event.preventDefault();
        resultsRef.current[activeIndex].action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, activeIndex]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const navigationResults = navigationItems
      .filter((item) => !normalized || item.label.toLowerCase().includes(normalized))
      .map((item) => ({
        ...item,
        kind: 'navigation',
        action: () => {
          onNavigate(item.id);
          onClose();
        },
      }));

    const vocabularyResults = vocabularies
      .filter((vocab) => {
        if (!normalized) return true;
        const haystack = [
          vocab.word,
          vocab.meaning,
          vocab.notes,
          ...(vocab.synonyms || []),
          ...(vocab.tags || []),
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 8)
      .map((vocab) => ({
        id: `vocab-${vocab.id}`,
        label: vocab.word,
        detail: vocab.meaning,
        icon: BookOpen,
        kind: 'vocabulary',
        action: () => {
          onSelectVocab(vocab);
          onClose();
        },
      }));

    return [...navigationResults, ...vocabularyResults];
  }, [onClose, onNavigate, onSelectVocab, query, vocabularies]);

  resultsRef.current = results;

  if (!isOpen) return null;

  return (
    <div className="command-backdrop" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-search-row">
          <Search size={19} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search the vault or jump to a view..."
            aria-label="Search the vault"
          />
          <button className="command-close" onClick={onClose} aria-label="Close command palette"><X size={17} /></button>
        </div>
        <div className="command-hint"><span><Command size={12} /> K</span><span>Navigate with ↑ ↓</span><span>Enter to open</span></div>
        <div className="command-results">
          {results.length > 0 ? results.map((result, index) => {
            const Icon = result.icon;
            return (
              <button
                key={result.id}
                className={`command-result ${index === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={result.action}
              >
                <span className="command-result-icon"><Icon size={16} /></span>
                <span className="command-result-copy">
                  <strong>{result.label}</strong>
                  {result.detail && <small>{result.detail}</small>}
                </span>
                {result.kind === 'navigation' && <small className="command-result-type">Navigate</small>}
              </button>
            );
          }) : (
            <div className="command-empty">No commands or vocabulary entries match that search.</div>
          )}
        </div>
      </section>
    </div>
  );
}

