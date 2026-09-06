import { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const DRIFT_WORDS = [
  'perspicacious',
  'ameliorate',
  'eschew',
  'ubiquitous',
  'conundrum',
  'magniloquent',
  'lexicon',
  'eloquence',
  'lucid',
  'verve',
  'ephemeral',
  'serendipity',
  'quintessential',
  'paradigm',
  'nuance',
  'sagacious',
  'perspicuity',
  'mellifluous',
  'ineffable',
  'ephemeral',
];

const WORD_LAYOUT = [
  ['8%', '12%', '0s', '28s'],
  ['72%', '8%', '3s', '34s'],
  ['18%', '82%', '6s', '30s'],
  ['85%', '62%', '2s', '36s'],
  ['5%', '48%', '9s', '32s'],
  ['62%', '88%', '4s', '38s'],
  ['38%', '18%', '12s', '29s'],
  ['78%', '40%', '7s', '35s'],
  ['15%', '32%', '14s', '31s'],
  ['92%', '25%', '1s', '33s'],
  ['45%', '72%', '10s', '37s'],
  ['28%', '55%', '5s', '26s'],
  ['68%', '15%', '11s', '39s'],
  ['12%', '65%', '8s', '27s'],
  ['55%', '38%', '13s', '40s'],
  ['25%', '72%', '15s', '42s'],
  ['88%', '45%', '16s', '38s'],
  ['42%', '8%', '17s', '44s'],
  ['65%', '92%', '18s', '36s'],
  ['8%', '55%', '19s', '32s'],
];

export default function AnimatedBackground({ theme = 'dark' }) {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    
    // Enhanced particle system with more sophisticated movement
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.3,
      s: Math.random() * 0.00015 + 0.00003,
      a: Math.random() * Math.PI * 2,
      layer: Math.floor(Math.random() * 4),
      vx: (Math.random() - 0.5) * 0.0002,
      vy: (Math.random() - 0.5) * 0.0002,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    // Atmospheric gradient orbs
    const orbs = Array.from({ length: 5 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 0.3 + 0.2,
      vx: (Math.random() - 0.5) * 0.0001,
      vy: (Math.random() - 0.5) * 0.0001,
      hue: Math.random() * 40 + 170, // Cyan to teal range
    }));

    let frame = 0;
    let running = true;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      if (!running) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);
      
      const baseColor = theme === 'light' ? '8, 127, 145' : '82, 215, 232';
      const secondaryColor = theme === 'light' ? '120, 180, 170' : '100, 200, 190';

      // Draw atmospheric orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        
        // Bounce off edges
        if (orb.x < 0 || orb.x > 1) orb.vx *= -1;
        if (orb.y < 0 || orb.y > 1) orb.vy *= -1;
        
        const gradient = context.createRadialGradient(
          orb.x * width, orb.y * height, 0,
          orb.x * width, orb.y * height, orb.radius * Math.min(width, height)
        );
        
        const hue = orb.hue + Math.sin(frame * 0.001) * 10;
        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.03)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 60%, 50%, 0.015)`);
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      });

      // Draw particles with enhanced movement
      particles.forEach((particle) => {
        particle.a += particle.s;
        particle.x += particle.vx;
        particle.y += particle.vy - 0.00008; // Slight upward drift
        particle.pulse += particle.pulseSpeed;
        
        // Wrap around edges
        if (particle.x < -0.05) particle.x = 1.05;
        if (particle.x > 1.05) particle.x = -0.05;
        if (particle.y < -0.05) particle.y = 1.05;
        if (particle.y > 1.05) particle.y = -0.05;

        const x = (particle.x + Math.sin(particle.a) * 0.015) * width;
        const y = particle.y * height;
        const pulse = Math.sin(particle.pulse) * 0.3 + 1;
        const opacity = (0.08 + particle.r * 0.06) * (1 - particle.layer * 0.18) * pulse;
        const size = particle.r * (1 + particle.layer * 0.2) * pulse;

        // Particle glow
        const gradient = context.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(0, `rgba(${baseColor}, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(${secondaryColor}, ${opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        context.beginPath();
        context.fillStyle = gradient;
        context.arc(x, y, size * 3, 0, Math.PI * 2);
        context.fill();
        
        // Core particle
        context.beginPath();
        context.fillStyle = `rgba(${baseColor}, ${opacity * 1.5})`;
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      });

      // Subtle connecting lines between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = (p1.x - p2.x) * width;
          const dy = (p1.y - p2.y) * height;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150 && p1.layer === p2.layer) {
            const opacity = (1 - distance / 150) * 0.03;
            context.beginPath();
            context.strokeStyle = `rgba(${baseColor}, ${opacity})`;
            context.lineWidth = 0.5;
            context.moveTo(p1.x * width, p1.y * height);
            context.lineTo(p2.x * width, p2.y * height);
            context.stroke();
          }
        });
      });

      frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = document.visibilityState !== 'hidden';
      if (running) frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced, theme]);

  return (
    <div className={`ambient-background ambient-${theme} ${reduced ? 'is-static' : ''}`} aria-hidden="true">
      <div className="ambient-grain" />
      <div className="ambient-rays" />
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />
      <div className="ambient-glow ambient-glow-three" />
      <div className="ambient-glow ambient-glow-four" />
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="ambient-orb ambient-orb-d" />
      <div className="ambient-grid" />
      <canvas ref={canvasRef} className="ambient-particles" />
      {!reduced && (
        <div className="ambient-words">
          {DRIFT_WORDS.map((word, index) => {
            const [left, top, delay, duration] = WORD_LAYOUT[index];
            return (
              <span key={word} style={{ left, top, animationDelay: delay, animationDuration: duration }}>
                {word}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
