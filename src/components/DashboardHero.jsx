import { motion } from 'motion/react';
import CountUp from './CountUp';
import { getVaultStats } from '../utils/vaultStats';

export default function DashboardHero({ vocabularies = [], userId, onAddClick }) {
  const stats = getVaultStats(vocabularies, userId);
  const empty = vocabularies.length === 0;

  const items = [
    { label: 'WORDS', value: stats.words },
    { label: 'MASTERED', value: stats.mastered },
    { label: 'REVISION', value: stats.revision },
    { label: 'FAVORITES', value: stats.favorites },
  ];

  return (
    <section className="vault-hero-compact" aria-label="Vault overview">
      {empty ? (
        <motion.div 
          className="empty-state vault-empty-state"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="empty-state-title">Your vault is empty.</h3>
          <p className="empty-state-desc">Every sophisticated vocabulary begins with its first word.</p>
          <motion.button 
            className="empty-state-btn" 
            type="button" 
            onClick={onAddClick}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(71, 212, 208, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Add Your First Word
          </motion.button>
        </motion.div>
      ) : (
        <div className="vault-stats-compact">
          {items.map((item, index) => (
            <motion.div
              className="vault-stat-item"
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -2,
                transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
              }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <small>{item.label}</small>
              <strong><CountUp value={item.value} /></strong>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
