import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Check, Clock3, Flame, LockKeyhole, RotateCcw, Target, Trophy } from 'lucide-react';

const todayKey = () => new Date().toISOString().slice(0, 10);
const hash = (value) => [...value].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 7);
const storageKey = (userId, suffix) => `vocab_vault_${suffix}_${userId || 'guest'}`;
const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
};
const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const dateBefore = (date, days) => {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() - days);
  return value.toISOString().slice(0, 10);
};

export default function DashboardInsights({ vocabularies = [], user, onOpenWord, onQuickRevision }) {
  const [, setRefresh] = useState(0);
  const date = todayKey();
  const userId = user?.id || user?.email || 'guest';
  const sortedVocabulary = useMemo(() => [...vocabularies].sort((a, b) => Number(a.id) - Number(b.id)), [vocabularies]);
  const daily = (() => {
    if (!sortedVocabulary.length) return null;
    const key = storageKey(userId, 'daily_word');
    const saved = readJson(key, null);
    const savedWord = saved?.date === date ? sortedVocabulary.find((vocab) => String(vocab.id) === String(saved.id)) : null;
    if (savedWord) return { ...saved, vocab: savedWord };
    const vocab = sortedVocabulary[hash(`${userId}:${date}`) % sortedVocabulary.length];
    const next = { date, id: vocab.id, status: 'pending' };
    writeJson(key, next);
    return { ...next, vocab };
  })();
  const history = readJson(storageKey(userId, 'daily_history'), {});
  const stats = readJson(storageKey(userId, 'revision_stats'), { days: {} });
  const currentStatus = daily?.status || 'pending';
  const streak = useMemo(() => {
    let count = 0;
    let cursor = date;
    while (history[cursor] === 'learned') { count += 1; cursor = dateBefore(cursor, 1); }
    return count;
  }, [date, history]);
  const longestStreak = useMemo(() => {
    let longest = 0;
    Object.keys(history).sort().forEach((day) => {
      if (history[day] !== 'learned') return;
      let length = 1;
      while (history[dateBefore(day, length)] === 'learned') length += 1;
      longest = Math.max(longest, length);
    });
    return longest;
  }, [history]);
  const todayRevision = stats.days?.[date] || { completed: 0, correct: 0, wrong: 0 };
  const todayAccuracy = todayRevision.completed ? Math.round((todayRevision.correct / (todayRevision.correct + todayRevision.wrong)) * 1000) / 10 : 0;
  const weakWords = [...sortedVocabulary].sort((a, b) => {
    const aStats = stats.words?.[a.id] || { wrong: 0, reviewed: 0 };
    const bStats = stats.words?.[b.id] || { wrong: 0, reviewed: 0 };
    return (bStats.wrong * 3 - bStats.reviewed) - (aStats.wrong * 3 - aStats.reviewed);
  }).slice(0, 3);
  const milestones = [
    [50, '50 words collected', vocabularies.length >= 50],
    [100, '100 words collected', vocabularies.length >= 100],
    [7, '7-day streak', longestStreak >= 7],
    [30, '30-day streak', longestStreak >= 30],
    [100, '100 revisions completed', Object.values(stats.days || {}).reduce((sum, day) => sum + (day.completed || 0), 0) >= 100],
  ].filter(([, , achieved]) => achieved);

  const updateDailyStatus = (status) => {
    if (!daily) return;
    writeJson(storageKey(userId, 'daily_word'), { date, id: daily.vocab.id, status });
    writeJson(storageKey(userId, 'daily_history'), { ...history, [date]: status });
    setRefresh((value) => value + 1);
  };

  if (!daily) return <section className="dashboard-insights dashboard-insights-empty"><div className="insight-empty-icon"><BookOpen size={18} /></div><div><span className="dashboard-overline">Daily practice</span><h2>Your first word is waiting.</h2><p>Add a vocabulary entry to unlock Word of the Day, streaks, and progress.</p></div></section>;

  return (
    <div className="dashboard-insights">
      <motion.section className="word-of-day-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24 }}>
        <div className="wod-topline"><span className="dashboard-overline">Word of the day</span><span className="wod-date"><LockKeyhole size={11} /> {date}</span></div>
        <div className="wod-content"><div><h2>{daily.vocab.word}</h2><p>{daily.vocab.meaning}</p>{daily.vocab.tags?.length > 0 && <div className="wod-tags">{daily.vocab.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>}</div><button className="wod-open-btn" type="button" onClick={() => onOpenWord?.(daily.vocab)}>View word <ArrowRight size={15} /></button></div>
        <div className="wod-actions"><span className={`wod-status wod-status-${currentStatus}`}>{currentStatus === 'learned' ? <><Check size={14} /> Learned today</> : currentStatus === 'review' ? <><Clock3 size={14} /> Review later</> : 'Not completed'}</span><div><button type="button" className={currentStatus === 'learned' ? 'is-selected' : ''} onClick={() => updateDailyStatus('learned')}><Check size={14} /> Learned</button><button type="button" className={currentStatus === 'review' ? 'is-selected' : ''} onClick={() => updateDailyStatus('review')}><Clock3 size={14} /> Review later</button></div></div>
      </motion.section>

      <div className="dashboard-insight-grid">
        <motion.section className="insight-panel streak-panel" {...{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: .04, duration: .24 } }}><div className="insight-panel-heading"><span className="dashboard-overline">Consistency</span><Flame size={17} /></div><div className="streak-value"><strong>{streak}</strong><span>day streak</span></div><p>Longest run: <b>{longestStreak} days</b></p></motion.section>
        <motion.section className="insight-panel progress-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .24 }}><div className="insight-panel-heading"><span className="dashboard-overline">Today’s progress</span><Target size={17} /></div><div className="progress-stat"><span>Word of the Day</span><b>{currentStatus === 'learned' ? 'Complete' : currentStatus === 'review' ? 'Queued' : 'Open'}</b></div><div className="progress-stat"><span>Revision words</span><b>{todayRevision.completed}</b></div><div className="progress-stat"><span>Accuracy</span><b>{todayAccuracy}%</b></div></motion.section>
        <motion.section className="insight-panel quick-revision-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .24 }}><div className="insight-panel-heading"><span className="dashboard-overline">Keep moving</span><RotateCcw size={17} /></div><h3>Quick revision</h3><p>Five words, no setup.</p><button type="button" onClick={() => onQuickRevision?.()} >Revise 5 words <ArrowRight size={15} /></button></motion.section>
      </div>

      <div className="dashboard-lower-grid"><section className="insight-panel weak-words-panel"><div className="insight-panel-heading"><div><span className="dashboard-overline">Needs another pass</span><h3>Weak words</h3></div><span className="insight-count">{weakWords.length}</span></div>{weakWords.length ? <div className="weak-word-list">{weakWords.map((vocab) => <button key={vocab.id} type="button" onClick={() => onOpenWord?.(vocab)}><span>{vocab.word}</span><ArrowRight size={14} /></button>)}</div> : <p className="insight-empty-copy">Your revision history will shape this list.</p>}</section><section className="insight-panel milestones-panel"><div className="insight-panel-heading"><div><span className="dashboard-overline">Quiet markers</span><h3>Milestones</h3></div><Trophy size={17} /></div>{milestones.length ? <div className="milestone-list">{milestones.map(([, label]) => <span key={label}><Check size={13} />{label}</span>)}</div> : <p className="insight-empty-copy">Keep collecting. The first marker is close.</p>}</section></div>
    </div>
  );
}
