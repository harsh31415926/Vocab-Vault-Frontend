import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Check, ChevronRight, ArrowRight, SlidersHorizontal, RotateCcw, X } from 'lucide-react';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export default function RevisionMode({ vocabularies = [], quickStart = false, userId = 'guest' }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [requestedCount, setRequestedCount] = useState('20');
  const [customCount, setCustomCount] = useState('');
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const allTags = useMemo(() => {
    const tags = new Set();
    vocabularies.forEach((vocab) => (vocab.tags || []).forEach((tag) => tag && tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [vocabularies]);

  const matchingVocabularies = useMemo(() => {
    if (selectedTags.length === 0) return vocabularies;
    return vocabularies.filter((vocab) => selectedTags.some((tag) => (vocab.tags || []).includes(tag)));
  }, [selectedTags, vocabularies]);

  const availableCount = matchingVocabularies.length;
  const parsedRequestedCount = requestedCount === 'custom' ? Number.parseInt(customCount, 10) : Number.parseInt(requestedCount, 10);
  const safeRequestedCount = Number.isFinite(parsedRequestedCount) && parsedRequestedCount > 0 ? parsedRequestedCount : 1;

  useEffect(() => {
    if (requestedCount === 'custom' && customCount && Number.parseInt(customCount, 10) > availableCount) {
      setCustomCount(String(availableCount || 1));
    }
  }, [availableCount, customCount, requestedCount]);

  const startSession = useCallback((requestedSize = safeRequestedCount) => {
    if (!availableCount) return;
    const sessionDeck = shuffle(matchingVocabularies).slice(0, Math.min(requestedSize, availableCount));
    setDeck(sessionDeck);
    setCurrentIndex(0);
    setShowMeaning(false);
    setCompleted(false);
    setScore({ correct: 0, wrong: 0 });
    setStarted(true);
  }, [availableCount, matchingVocabularies, safeRequestedCount]);

  useEffect(() => {
    if (quickStart && availableCount) startSession(5);
  }, [availableCount, quickStart, startSession]);

  const recordRevisionResult = (vocabId, wasCorrect) => {
    const key = `vocab_vault_revision_stats_${userId || 'guest'}`;
    let existing = { days: {}, words: {} };
    try { existing = JSON.parse(localStorage.getItem(key) || JSON.stringify(existing)); } catch { /* fall back to a fresh local session history */ }
    const date = new Date().toISOString().slice(0, 10);
    const day = existing.days?.[date] || { completed: 0, correct: 0, wrong: 0 };
    const word = existing.words?.[vocabId] || { reviewed: 0, wrong: 0 };
    localStorage.setItem(key, JSON.stringify({
      days: { ...existing.days, [date]: { completed: day.completed + 1, correct: day.correct + (wasCorrect ? 1 : 0), wrong: day.wrong + (wasCorrect ? 0 : 1) } },
      words: { ...existing.words, [vocabId]: { reviewed: word.reviewed + 1, wrong: word.wrong + (wasCorrect ? 0 : 1) } }
    }));
  };

  const resetToSetup = () => {
    setStarted(false);
    setCompleted(false);
    setDeck([]);
    setCurrentIndex(0);
    setShowMeaning(false);
    setScore({ correct: 0, wrong: 0 });
  };

  const toggleTag = (tag) => {
    setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  };

  const handleNext = (wasCorrect) => {
    setScore((current) => ({ ...current, [wasCorrect ? 'correct' : 'wrong']: current[wasCorrect ? 'correct' : 'wrong'] + 1 }));
    recordRevisionResult(currentVocab.id, wasCorrect);
    if (currentIndex + 1 >= deck.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((index) => index + 1);
      setShowMeaning(false);
    }
  };

  if (vocabularies.length === 0) {
    return <div className="revision-container"><div className="revision-empty-state"><Layers size={48} className="sidebar-logo-icon" style={{ opacity: 0.4, marginBottom: '8px' }} /><h3 className="revision-empty-title">Vault is Empty</h3><p className="revision-empty-text">You need to add words to your vault before you can start a revision session.</p></div></div>;
  }

  if (!started) {
    return (
      <motion.div className="revision-container revision-setup-container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <section className="revision-setup-card" aria-labelledby="revision-setup-title">
          <div className="revision-setup-kicker"><SlidersHorizontal size={14} /> Session configuration</div>
          <div className="revision-setup-heading"><div><h2 id="revision-setup-title">Revision Setup</h2><p>Choose the words you want to put back into motion.</p></div><span className="revision-setup-index">01</span></div>
          <div className="revision-setup-rule" />
          <div className="revision-setting">
            <div className="revision-setting-label"><span>Words to revise</span><small>How many cards should this session include?</small></div>
            <div className="revision-count-options" role="group" aria-label="Number of words">
              {['10', '20', '30', '50'].map((count) => <button type="button" key={count} className={requestedCount === count ? 'is-active' : ''} onClick={() => setRequestedCount(count)} disabled={availableCount < Number(count)}>{count}</button>)}
              <button type="button" className={requestedCount === 'custom' ? 'is-active' : ''} onClick={() => setRequestedCount('custom')}>Custom</button>
            </div>
            {requestedCount === 'custom' && <label className="revision-custom-count"><span className="sr-only">Custom word count</span><input type="number" min="1" max={availableCount || 1} value={customCount} onChange={(event) => setCustomCount(event.target.value)} placeholder={`1–${availableCount}`} /></label>}
          </div>
          <div className="revision-setting">
            <div className="revision-setting-label"><span>Tags</span><small>Leave empty to use every word in your vault.</small></div>
            <div className="revision-tag-options" role="group" aria-label="Filter by tags">
              <button type="button" className={selectedTags.length === 0 ? 'is-active all-tags' : 'all-tags'} onClick={() => setSelectedTags([])}>All tags</button>
              {allTags.map((tag) => <button type="button" key={tag} className={selectedTags.includes(tag) ? 'is-active' : ''} onClick={() => toggleTag(tag)}>#{tag}</button>)}
            </div>
          </div>
          <div className="revision-setup-summary"><div><span>Available</span><strong>{availableCount} {availableCount === 1 ? 'word' : 'words'}</strong></div><div><span>Session size</span><strong>{Math.min(safeRequestedCount, availableCount)} {Math.min(safeRequestedCount, availableCount) === 1 ? 'word' : 'words'}</strong></div></div>
          <button type="button" className="revision-start-btn" onClick={startSession} disabled={!availableCount || (requestedCount === 'custom' && !customCount)}><span>Start revision</span><ArrowRight size={16} /></button>
          <p className="revision-setup-note">Your score is temporary and resets with every new session.</p>
        </section>
      </motion.div>
    );
  }

  const totalAttempted = score.correct + score.wrong;
  const accuracy = totalAttempted ? Math.round((score.correct / totalAttempted) * 1000) / 10 : 0;

  if (completed) {
    return <motion.div className="revision-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="revision-card revision-complete-card"><div className="revision-complete-mark"><Check size={28} /></div><span className="revision-progress">Session complete</span><h3 className="revision-word">Good work.</h3><p className="revision-empty-text">You reviewed all {deck.length} words in this session.</p><div className="revision-complete-score"><span><strong>{score.correct}</strong> correct</span><span><strong>{score.wrong}</strong> wrong</span><span><strong>{accuracy}%</strong> accuracy</span></div><div className="revision-complete-actions"><button className="revision-reveal-btn" onClick={resetToSetup}><RotateCcw size={14} /> New session</button><button className="revision-secondary-btn" onClick={() => { setStarted(true); setCompleted(false); setCurrentIndex(0); setShowMeaning(false); setScore({ correct: 0, wrong: 0 }); setDeck(shuffle(matchingVocabularies).slice(0, Math.min(safeRequestedCount, availableCount))); }}>Repeat session</button></div></div></motion.div>;
  }

  const currentVocab = deck[currentIndex];
  if (!currentVocab) return null;

  return (
    <motion.div className="revision-container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="revision-session-bar"><div><span className="revision-progress">Revision session</span><strong>{currentIndex + 1} <span>/ {deck.length}</span></strong></div><div className="revision-score" aria-label="Current session score"><span className="score-correct">✓ {score.correct}</span><span className="score-wrong">✕ {score.wrong}</span><span>{accuracy}%</span></div><button type="button" className="revision-exit-btn" onClick={resetToSetup} aria-label="End revision session"><X size={15} /></button></div>
      <div className="revision-card">
        <div className="revision-progress">Card {currentIndex + 1} of {deck.length}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><h2 className="revision-word">{currentVocab.word}</h2><div className="revision-tags">{currentVocab.tags && currentVocab.tags.map((tag, idx) => <span key={idx} className="tag-badge">#{tag}</span>)}</div>{!showMeaning && <button className="revision-reveal-btn" onClick={() => setShowMeaning(true)}>Reveal Meaning</button>}</div>
        {showMeaning ? <div className="revision-details"><div className="revision-section"><span className="revision-section-title">Meaning</span><p className="revision-meaning">{currentVocab.meaning}</p></div>{currentVocab.synonyms && currentVocab.synonyms.length > 0 && <div className="revision-section"><span className="revision-section-title">Synonyms</span><div className="array-items-list" style={{ marginTop: '4px' }}>{currentVocab.synonyms.map((syn, idx) => <span key={idx} className="tag-badge">{syn}</span>)}</div></div>}{currentVocab.examples && currentVocab.examples.length > 0 && <div className="revision-section"><span className="revision-section-title">Examples</span><div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{currentVocab.examples.map((ex, idx) => <p key={idx} className="revision-section-content" style={{ fontStyle: 'italic' }}>&quot;{ex}&quot;</p>)}</div></div>}{currentVocab.notes && <div className="revision-section"><span className="revision-section-title">My Notes</span><p className="revision-section-content notes">{currentVocab.notes}</p></div>}<div className="revision-actions" style={{ marginTop: '16px' }}><button className="revision-action-btn unknown" onClick={() => handleNext(false)}>Skip / Hard</button><button className="revision-action-btn known" onClick={() => handleNext(true)}><span>Got It</span><ChevronRight size={16} style={{ marginLeft: '4px', verticalAlign: 'middle' }} /></button></div></div> : <div style={{ height: '180px' }} />}
      </div>
    </motion.div>
  );
}
