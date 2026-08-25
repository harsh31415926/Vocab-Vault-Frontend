import React from 'react';

const fragments = [
  ['lexicon', '12%', '18%', '0.58s'],
  ['/ˈvɜːrb/', '78%', '14%', '2.2s'],
  ['signal → meaning', '24%', '82%', '1.3s'],
  ['01—07', '84%', '71%', '3.1s'],
  ['context', '7%', '58%', '2.7s'],
  ['Δ vocabulary', '66%', '88%', '0.9s'],
];

export default function AnimatedBackground({ theme = 'dark' }) {
  return (
    <div className={`ambient-background ambient-${theme}`} aria-hidden="true">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />
      <div className="ambient-grid" />
      <svg className="ambient-graph" viewBox="0 0 1200 600" preserveAspectRatio="none">
        <path d="M0 440 C120 410 160 470 270 400 S420 330 520 390 S680 500 790 360 S960 250 1200 300" />
        <path d="M0 510 C170 470 220 510 340 465 S560 400 690 450 S860 520 990 400 S1110 350 1200 370" />
        <circle cx="790" cy="360" r="4" />
        <circle cx="990" cy="400" r="4" />
      </svg>
      <div className="ambient-fragments">
        {fragments.map(([text, left, top, delay]) => (
          <span key={text} style={{ left, top, animationDelay: delay }}>{text}</span>
        ))}
      </div>
    </div>
  );
}

