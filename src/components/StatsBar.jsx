import React, { useMemo } from 'react';
import { BookMarked, CalendarDays, Flame, Star } from 'lucide-react';

function isThisWeek(dateValue) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay();
  const distanceFromMonday = day === 0 ? 6 : day - 1;
  start.setDate(now.getDate() - distanceFromMonday);
  start.setHours(0, 0, 0, 0);
  return date >= start;
}

export default function StatsBar({ vocabularies = [] }) {
  const stats = useMemo(() => {
    const tagCounts = new Map();
    vocabularies.forEach((vocab) => (vocab.tags || []).forEach((tag) => {
      if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }));
    const mostUsedTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return [
      { label: 'Words in vault', value: vocabularies.length, icon: BookMarked, tone: 'cyan' },
      { label: 'Starred entries', value: vocabularies.filter((vocab) => vocab.is_favorite).length, icon: Star, tone: 'gold' },
      { label: 'Added this week', value: vocabularies.filter((vocab) => isThisWeek(vocab.created_at)).length, icon: CalendarDays, tone: 'violet' },
      { label: 'Signature tag', value: mostUsedTag ? `#${mostUsedTag}` : '—', icon: Flame, tone: 'teal' },
    ];
  }, [vocabularies]);

  return (
    <div className="stats-bar" aria-label="Vocabulary statistics">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <div className="stat-item" key={label}>
          <span className={`stat-icon stat-icon-${tone}`}><Icon size={16} /></span>
          <span className="stat-copy"><strong>{value}</strong><small>{label}</small></span>
        </div>
      ))}
    </div>
  );
}

