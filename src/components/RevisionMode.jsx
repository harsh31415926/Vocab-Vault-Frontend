import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Layers, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const today = () => new Date().toISOString().slice(0, 10);
const storageKey = (userId, suffix) => `vocab_vault_revision_${suffix}_${userId || 'guest'}`;
const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export default function RevisionMode({ vocabularies = [], quickStart = false, userId = 'guest', onBackDashboard }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [requestedCount, setRequestedCount] = useState('20');
  const [customCount, setCustomCount] = useState('');
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [answers, setAnswers] = useState({});
  const [sessionHistory, setSessionHistory] = useState(() => readJson(storageKey(userId, 'history'), []));

  const allTags = useMemo(() => [...new Set(vocabularies.flatMap((vocab) => Array.isArray(vocab.tags) ? vocab.tags.filter(Boolean) : []))].sort((a, b) => a.localeCompare(b)), [vocabularies]);
  const matchingVocabularies = useMemo(() => selectedTags.length ? vocabularies.filter((vocab) => selectedTags.some((tag) => vocab.tags?.includes(tag))) : vocabularies, [selectedTags, vocabularies]);
  const availableCount = matchingVocabularies.length;
  const rawCount = requestedCount === 'custom' ? Number.parseInt(customCount, 10) : Number.parseInt(requestedCount, 10);
  const safeRequestedCount = Number.isFinite(rawCount) && rawCount > 0 ? Math.min(rawCount, availableCount) : Math.min(1, availableCount);
  const currentVocab = deck[currentIndex];
  const totalAttempted = score.correct + score.wrong;
  const accuracy = totalAttempted ? Math.round((score.correct / totalAttempted) * 1000) / 10 : 0;
  const wrongWords = deck.filter((vocab) => answers[vocab.id]?.result !== 'correct');
  const strongWords = deck.filter((vocab) => answers[vocab.id]?.result === 'correct');
  const persistedStats = readJson(`vocab_vault_revision_stats_${userId || 'guest'}`, { days: {}, words: {} });
  const dailyStats = persistedStats.days || {};
  const todayStats = dailyStats[today()] || { completed: 0, correct: 0, wrong: 0 };

  useEffect(() => {
    if (requestedCount === 'custom' && customCount && Number.parseInt(customCount, 10) > availableCount) setCustomCount(String(availableCount || 1));
  }, [availableCount, customCount, requestedCount]);

  const startSession = useCallback((size = safeRequestedCount, sourceDeck = matchingVocabularies) => {
    if (!sourceDeck.length) return;
    const retention = readJson(`vocab_vault_revision_stats_${userId || 'guest'}`, { words: {} }).words || {};
    const ranked = [...sourceDeck].sort((a, b) => {
      const aStats = retention[a.id] || { wrong: 0, hard: 0 };
      const bStats = retention[b.id] || { wrong: 0, hard: 0 };
      return (bStats.hard * 3 + bStats.wrong * 2) - (aStats.hard * 3 + aStats.wrong * 2);
    });
    const targetSize = Math.min(size, sourceDeck.length);
    const prioritySize = Math.ceil(targetSize * 0.6);
    const nextDeck = [...shuffle(ranked.slice(0, prioritySize)), ...shuffle(ranked.slice(prioritySize))].slice(0, targetSize);
    setDeck(nextDeck); setCurrentIndex(0); setShowMeaning(false); setCompleted(false); setStarted(true); setScore({ correct: 0, wrong: 0 }); setAnswers({});
  }, [matchingVocabularies, safeRequestedCount, userId]);

  useEffect(() => {
    if (quickStart && !started && !completed && availableCount) startSession(5);
  }, [availableCount, completed, quickStart, started, startSession]);

  const persistAnswer = (vocabId, type) => {
    const answerKey = String(vocabId);
    setAnswers((current) => ({ ...current, [answerKey]: { result: type === 'got-it' ? 'correct' : 'wrong', type } }));
    const currentAnswers = answers[answerKey];
    if (currentAnswers) return;
    const statsKey = `vocab_vault_revision_stats_${userId || 'guest'}`;
    const stats = readJson(statsKey, { days: {}, words: {} });
    const date = today(); const day = stats.days?.[date] || { completed: 0, correct: 0, wrong: 0 };
    const word = stats.words?.[answerKey] || { reviewed: 0, wrong: 0, hard: 0 };
    writeJson(statsKey, { days: { ...stats.days, [date]: { completed: day.completed + 1, correct: day.correct + (type === 'got-it' ? 1 : 0), wrong: day.wrong + (type === 'got-it' ? 0 : 1) } }, words: { ...stats.words, [answerKey]: { reviewed: word.reviewed + 1, wrong: word.wrong + (type === 'got-it' ? 0 : 1), hard: word.hard + (type === 'hard' ? 1 : 0), lastReviewed: date } } });
  };

  const handleAnswer = (type) => {
    if (!currentVocab || answers[currentVocab.id]) { if (currentIndex + 1 < deck.length) { setCurrentIndex((index) => index + 1); setShowMeaning(false); } return; }
    const isCorrect = type === 'got-it';
    persistAnswer(currentVocab.id, type);
    setScore((current) => ({ correct: current.correct + (isCorrect ? 1 : 0), wrong: current.wrong + (isCorrect ? 0 : 1) }));
    if (currentIndex + 1 >= deck.length) {
      const nextHistory = [{ date: today(), words: deck.length, correct: score.correct + (isCorrect ? 1 : 0), wrong: score.wrong + (isCorrect ? 0 : 1), accuracy: Math.round(((score.correct + (isCorrect ? 1 : 0)) / deck.length) * 1000) / 10 }, ...sessionHistory].slice(0, 12);
      writeJson(storageKey(userId, 'history'), nextHistory); setSessionHistory(nextHistory); setCompleted(true);
    } else { setCurrentIndex((index) => index + 1); setShowMeaning(false); }
  };

  const handlePrevious = () => { if (currentIndex > 0) { setCurrentIndex((index) => index - 1); setShowMeaning(true); } };
  const resetToSetup = () => { setStarted(false); setCompleted(false); setDeck([]); setCurrentIndex(0); setShowMeaning(false); setScore({ correct: 0, wrong: 0 }); setAnswers({}); };

  if (!vocabularies.length) return <div className="revision-container"><div className="revision-empty-state"><Layers size={42} className="sidebar-logo-icon" /><h3 className="revision-empty-title">No vocabulary available for revision.</h3><p className="revision-empty-text">Add a word to your vault before starting a revision session.</p><button type="button" className="revision-reveal-btn" onClick={onBackDashboard}><ArrowLeft size={14} /> Add Vocabulary</button></div></div>;

  if (!started && !completed) return <motion.div className="revision-container revision-setup-container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}><section className="revision-setup-card" aria-labelledby="revision-setup-title"><div className="revision-setup-kicker"><SlidersHorizontal size={14} /> Session configuration</div><div className="revision-setup-heading"><div><h2 id="revision-setup-title">Revision Setup</h2><p>Choose the words you want to put back into motion.</p></div><span className="revision-setup-index">01</span></div><div className="revision-setup-rule" /><div className="revision-setting"><div className="revision-setting-label"><span>Words to revise</span><small>Available: {availableCount}</small></div><div className="revision-count-options" role="group" aria-label="Number of words">{['5', '10', '20', '30'].map((count) => <button type="button" key={count} className={requestedCount === count ? 'is-active' : ''} onClick={() => setRequestedCount(count)} disabled={availableCount < Number(count)}>{count}</button>)}<button type="button" className={requestedCount === 'custom' ? 'is-active' : ''} onClick={() => setRequestedCount('custom')}>Custom</button></div>{requestedCount === 'custom' && <label className="revision-custom-count"><span className="sr-only">Custom word count</span><input type="number" min="1" max={availableCount || 1} value={customCount} onChange={(event) => setCustomCount(event.target.value)} placeholder={`1–${availableCount}`} /></label>}</div><div className="revision-setting"><div className="revision-setting-label"><span>Tags</span><small>Leave empty to use every word.</small></div><div className="revision-tag-options" role="group" aria-label="Filter by tags"><button type="button" className={selectedTags.length === 0 ? 'is-active all-tags' : 'all-tags'} onClick={() => setSelectedTags([])}>All tags</button>{allTags.map((tag) => <button type="button" key={tag} className={selectedTags.includes(tag) ? 'is-active' : ''} onClick={() => setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}>#{tag}</button>)}</div></div><div className="revision-setup-summary"><div><span>Available</span><strong>{availableCount} words</strong></div><div><span>Session size</span><strong>{safeRequestedCount} words</strong></div></div><button type="button" className="revision-start-btn" onClick={() => startSession()} disabled={!availableCount || (requestedCount === 'custom' && !customCount)}><span>Start Revision</span><ArrowRight size={16} /></button><p className="revision-setup-note">Answers affect revision metadata only. Your vocabulary stays unchanged.</p>{sessionHistory.length > 0 && <div className="revision-history-panel"><h4>Recent sessions</h4><div className="revision-history-list">{sessionHistory.slice(0, 5).map((session, index) => <div className="revision-history-row" key={`${session.date}-${index}`}><span>{session.date}</span><span>{session.words} words</span><strong>{session.accuracy}%</strong></div>)}</div></div>}</section></motion.div>;

  if (completed) return <motion.div className="revision-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="revision-card revision-complete-card"><div className="revision-complete-mark"><Check size={28} /></div><span className="revision-progress">Revision complete</span><h3 className="revision-word">Session finished.</h3><p className="revision-empty-text">{deck.length} words reviewed · {accuracy}% accuracy</p><div className="revision-complete-score"><span><strong>{score.correct}</strong> correct</span><span><strong>{score.wrong}</strong> wrong</span><span><strong>{accuracy}%</strong> accuracy</span></div><div className="revision-result-columns"><div><span>Strong words</span>{strongWords.length ? strongWords.map((vocab) => <b key={vocab.id}>{vocab.word}</b>) : <small>Keep practising.</small>}</div><div><span>Needs review</span>{wrongWords.length ? wrongWords.map((vocab) => <b key={vocab.id}>{vocab.word}</b>) : <small>Nothing flagged.</small>}</div></div><div className="revision-complete-actions"><button className="revision-reveal-btn" onClick={() => startSession(safeRequestedCount, wrongWords.length ? wrongWords : matchingVocabularies)}><RotateCcw size={14} /> Review wrong words</button><button className="revision-secondary-btn" onClick={resetToSetup}>Start another session</button><button className="revision-secondary-btn" onClick={onBackDashboard}>Back to Dashboard</button></div></div></motion.div>;

  if (!currentVocab) return <div className="revision-container"><div className="revision-empty-state"><h3 className="revision-empty-title">Session unavailable</h3><p className="revision-empty-text">No cards are available for this session. Return to setup and try again.</p><button type="button" className="revision-reveal-btn" onClick={resetToSetup}>Return to setup</button></div></div>;

  return <motion.div className="revision-container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}><div className="revision-session-bar"><div><span className="revision-progress">Card {currentIndex + 1} / {deck.length}</span><strong>Revision session</strong></div><div className="revision-score"><span className="score-correct">✓ {score.correct} Correct</span><span className="score-wrong">✕ {score.wrong} Wrong</span><span>{accuracy}% Accuracy</span></div><button type="button" className="revision-exit-btn" onClick={resetToSetup} aria-label="Exit session"><X size={15} /></button></div><div className="revision-card"><div className="revision-progress">Today&apos;s revision · {Math.min(todayStats.completed, 10)} / 10</div><div className="revision-focus-word"><h2 className="revision-word">{currentVocab.word}</h2><div className="revision-tags">{currentVocab.tags?.map((tag, index) => <span key={`${tag}-${index}`} className="tag-badge">#{tag}</span>)}</div>{!showMeaning && <button className="revision-reveal-btn" onClick={() => setShowMeaning(true)}>Reveal Meaning</button>}</div>{showMeaning ? <div className="revision-details"><div className="revision-section"><span className="revision-section-title">Meaning</span><p className="revision-meaning">{currentVocab.meaning}</p></div>{currentVocab.examples?.length > 0 && <div className="revision-section"><span className="revision-section-title">Example</span><p className="revision-section-content"><em>&quot;{currentVocab.examples[0]}&quot;</em></p></div>}<div className="revision-actions"><button className="revision-action-btn unknown" onClick={() => handleAnswer('skip')}>Skip</button><button className="revision-action-btn unknown" onClick={() => handleAnswer('hard')}>Hard</button><button className="revision-action-btn known" onClick={() => handleAnswer('got-it')}><span>Got It</span><ChevronRight size={16} /></button></div><div className="revision-navigation"><button type="button" onClick={handlePrevious} disabled={currentIndex === 0}><ChevronLeft size={14} /> Previous</button><button type="button" onClick={resetToSetup}><RotateCcw size={14} /> Restart session</button></div></div> : <div className="revision-placeholder" />}</div></motion.div>;
}
