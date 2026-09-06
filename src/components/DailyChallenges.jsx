import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, BookOpen, CalendarDays, Check, Clock3, Flame, LockKeyhole, RotateCcw, Target, Trophy, Sparkles } from 'lucide-react';
import CountUp from './CountUp';

const getDate = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); };
const hash = (value) => [...value].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 7);
const key = (userId, name) => `vocab_vault_${name}_${userId || 'guest'}`;
const read = (name, userId, fallback) => { try { return JSON.parse(localStorage.getItem(key(userId, name)) || JSON.stringify(fallback)); } catch { return fallback; } };
const write = (name, userId, value) => localStorage.setItem(key(userId, name), JSON.stringify(value));
const previousDate = (date, days) => { const value = new Date(`${date}T12:00:00`); value.setDate(value.getDate() - days); return value.toISOString().slice(0, 10); };

export default function DailyChallenges({ vocabularies = [], user, onOpenWord, onQuickRevision }) {
  const [, refresh] = useState(0);
  const date = getDate();
  const userId = user?.id || user?.email || 'guest';
  const ordered = useMemo(() => [...vocabularies].sort((a, b) => Number(a.id) - Number(b.id)), [vocabularies]);
  const daily = useMemo(() => {
    if (!ordered.length) return null;
    const saved = read('daily_word', userId, null);
    const existing = saved?.date === date ? ordered.find((vocab) => String(vocab.id) === String(saved.id)) : null;
    if (existing) return { ...saved, vocab: existing };
    const vocab = ordered[hash(`${userId}:${date}`) % ordered.length];
    const next = { date, id: vocab.id, status: 'pending' };
    write('daily_word', userId, next);
    return { ...next, vocab };
  }, [date, ordered, userId]);
  const history = read('daily_history', userId, {});
  const stats = read('revision_stats', userId, { days: {}, words: {} });
  const status = daily?.status || 'pending';
  const currentStreak = useMemo(() => { let count = 0; let cursor = date; while (history[cursor] === 'learned') { count += 1; cursor = previousDate(cursor, 1); } return count; }, [date, history]);
  const longestStreak = useMemo(() => Object.keys(history).sort().reduce((longest, day) => { if (history[day] !== 'learned') return longest; let run = 1; while (history[previousDate(day, run)] === 'learned') run += 1; return Math.max(longest, run); }, 0), [history]);
  const today = stats.days?.[date] || { completed: 0, correct: 0, wrong: 0 };
  const revisionAccuracy = today.completed ? Math.round((today.correct / (today.correct + today.wrong)) * 100) : 0;
  const totalDailyActions = (status === 'learned' ? 1 : 0) + today.completed;
  const dailyScore = Math.min(100, Math.round((totalDailyActions / 6) * 100));
  const recentDays = Array.from({ length: 7 }, (_, index) => { const day = getDate(index - 6); return { day, label: new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1), complete: history[day] === 'learned' }; });
  const milestones = [7, 14, 30, 50, 100].map((value) => ({ value, achieved: longestStreak >= value }));
  const motivationalLines = ['Consistency compounds.', 'One word today. A stronger vocabulary tomorrow.', 'Your vocabulary is built one recall at a time.'];
  const motivation = motivationalLines[(currentStreak + today.completed) % motivationalLines.length];

  const updateStatus = (nextStatus) => { if (!daily || status === nextStatus) return; write('daily_word', userId, { date, id: daily.vocab.id, status: nextStatus }); write('daily_history', userId, { ...history, [date]: nextStatus }); refresh((value) => value + 1); };

  if (!daily) return <div className="daily-challenges-page"><section className="daily-empty-state"><BookOpen size={22} /><span className="dashboard-overline">Daily challenges</span><h2>Start with one word.</h2><p>Add a vocabulary entry to unlock your daily practice space.</p></section></div>;

  return <motion.div className="daily-challenges-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24 }}>
    <section className="daily-page-hero">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.span 
          className="dashboard-overline"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Sparkles size={12} style={{ marginRight: '6px', display: 'inline' }} />
          Daily challenges
        </motion.span>
        <h2>Small daily actions.<br /><em>Compounding vocabulary.</em></h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >{motivation}</motion.p>
      </motion.div>
      <motion.span 
        className="daily-hero-date"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <CalendarDays size={14} /> {date}
      </motion.span>
    </section>
    <motion.section 
      className="daily-metrics"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <span className="dashboard-overline">Current streak</span>
        <strong><Flame size={20} /> <CountUp value={currentStreak} /></strong>
        <small>consecutive days</small>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <span className="dashboard-overline">Longest streak</span>
        <strong><Trophy size={18} /> <CountUp value={longestStreak} /></strong>
        <small>best run</small>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <span className="dashboard-overline">Today's progress</span>
        <strong><CountUp value={dailyScore} />%</strong>
        <small>{totalDailyActions} actions recorded</small>
        <motion.span 
          className="daily-progress-track" 
          aria-hidden="true"
          initial={{ width: 0 }}
          animate={{ width: `${dailyScore}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <i style={{ width: '100%' }} />
        </motion.span>
      </motion.div>
    </motion.section>
    <motion.section 
      className="daily-main-grid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <div className="daily-primary-column">
        <motion.div 
          className="daily-section-label"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <span>01</span>
          <span className="dashboard-overline">Word of the day</span>
        </motion.div><section className="daily-word-card"><div className="daily-word-card-top"><span className="wod-date"><LockKeyhole size={11} /> Selected for {date}</span><span className={`wod-status wod-status-${status}`}>{status === 'learned' ? 'Completed' : status === 'review' ? 'Review later' : 'Not completed'}</span></div><h1>{daily.vocab.word}</h1><p className="daily-word-meaning">{daily.vocab.meaning}</p>{daily.vocab.tags?.length > 0 && <div className="wod-tags">{daily.vocab.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}{daily.vocab.examples?.[0] && <div className="daily-example"><span className="dashboard-overline">Example</span><p>&quot;{daily.vocab.examples[0]}&quot;</p></div>}<div className="daily-word-actions"><button type="button" className={status === 'learned' ? 'is-selected' : ''} onClick={() => updateStatus('learned')}><Check size={14} /> Learned</button><button type="button" className={status === 'review' ? 'is-selected' : ''} onClick={() => updateStatus('review')}><Clock3 size={14} /> Review later</button><button type="button" className="daily-link-btn" onClick={() => onOpenWord?.(daily.vocab)}>View word <ArrowRight size={14} /></button></div></section><div className="daily-section-label"><span>02</span><span className="dashboard-overline">Today's challenges</span></div><div className="challenge-list"><article className={`challenge-item ${status === 'learned' ? 'is-complete' : ''}`}><span className="challenge-icon"><Flame size={15} /></span><div><h3>Word of the Day</h3><p>Learn today&apos;s selected word.</p></div><span className="challenge-progress">{status === 'learned' ? <Check size={14} /> : 'Open'}</span></article><article className="challenge-item"><span className="challenge-icon"><RotateCcw size={15} /></span><div><h3>Quick Recall</h3><p>Recall five random saved words.</p></div><button type="button" onClick={() => onQuickRevision?.()}>Start <ArrowRight size={14} /></button></article><article className="challenge-item"><span className="challenge-icon"><Target size={15} /></span><div><h3>Daily Revision</h3><p>Complete five revision cards.</p><span className="daily-progress-track" aria-hidden="true"><i style={{ width: `${Math.min(100, (Math.min(today.completed, 5) / 5) * 100)}%` }} /></span></div><span className="challenge-progress">{Math.min(today.completed, 5)} / 5</span></article><article className="challenge-item"><span className="challenge-icon"><BookOpen size={15} /></span><div><h3>Use It</h3><p>Write a sentence using today&apos;s word.</p></div><span className="challenge-progress">Open</span></article><article className="challenge-item"><span className="challenge-icon"><Target size={15} /></span><div><h3>Weak Spot</h3><p>Review three words you got wrong before.</p></div><span className="challenge-progress">Open</span></article></div></div><aside className="daily-secondary-column"><section className="daily-side-panel"><div className="daily-side-heading"><div><span className="dashboard-overline">This week</span><h3>Streak calendar</h3></div><Flame size={16} /></div><div className="streak-calendar">{recentDays.map(({ day, label, complete }) => <div key={day}><span>{label}</span><i className={complete ? 'complete' : ''}>{complete ? <Check size={12} /> : ''}</i></div>)}</div><p className="daily-side-note">{currentStreak ? `${currentStreak} consecutive days and counting.` : 'Complete the Word of the Day to begin.'}</p></section><section className="daily-side-panel"><div className="daily-side-heading"><div><span className="dashboard-overline">Daily score</span><h3>Today</h3></div><span className="daily-score-value">{dailyScore}%</span></div><div className="daily-score-list"><span>Word of Day <b>{status === 'learned' ? '✓' : '—'}</b></span><span>Revision <b>{Math.min(today.completed, 5)} / 5</b></span><span>Accuracy <b>{revisionAccuracy}%</b></span></div></section><section className="daily-side-panel"><div className="daily-side-heading"><div><span className="dashboard-overline">Streak milestones</span><h3>Keep the line</h3></div><Trophy size={16} /></div><div className="streak-milestones">{milestones.map(({ value, achieved }) => <span className={achieved ? 'achieved' : ''} key={value}>{achieved ? <Check size={12} /> : <LockKeyhole size={11} />} {value} days</span>)}</div></section></aside></section><section className="daily-history-section"><div className="daily-section-label"><span>03</span><span className="dashboard-overline">History</span></div><div className="daily-history-list">{Object.keys(history).sort().reverse().slice(0, 5).map((day) => <div key={day}><span>{day}</span><span className={history[day] === 'learned' ? 'history-complete' : 'history-review'}>{history[day] === 'learned' ? <><Check size={13} /> Completed</> : <><Clock3 size={13} /> Review later</>}</span><b>{history[day] === 'learned' ? '100%' : '—'}</b></div>)}{!Object.keys(history).length && <p className="insight-empty-copy">Your completed days will appear here.</p>}</div></section>
  </motion.div>;
}
