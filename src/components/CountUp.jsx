import { useEffect, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

export default function CountUp({ value = 0, duration = 900, className }) {
  const reduced = usePrefersReducedMotion();
  const numeric = typeof value === 'number' && Number.isFinite(value);
  const [display, setDisplay] = useState(reduced || !numeric ? value : 0);

  useEffect(() => {
    if (!numeric) {
      setDisplay(value);
      return undefined;
    }
    if (reduced) {
      setDisplay(value);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(from + (value - from) * ease(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, numeric, reduced, value]);

  return <span className={className}>{display}</span>;
}
