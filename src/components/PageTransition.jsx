import { motion } from 'motion/react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

export default function PageTransition({ id, children, className = '' }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      key={id}
      className={`page-transition ${className}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(6px)', scale: 0.98 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)', scale: 0.985 }}
      transition={{ duration: reduced ? 0.12 : 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
