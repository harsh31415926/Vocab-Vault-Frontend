import { motion } from 'motion/react';
import CountUp from './CountUp';
import { getVaultStats } from '../utils/vaultStats';

export default function DashboardHero({ vocabularies = [], userId, onAddClick }) {
  const stats = getVaultStats(vocabularies, userId);
  const empty = vocabularies.length === 0;

  const items = [
    { label: 'Words', value: stats.words },
    { label: 'Mastered', value: stats.mastered },
    { label: 'Revision', value: stats.revision },
    { label: 'Favorites', value: stats.favorites },
  ];

  return (
    <section className="vault-hero" aria-label="Vault overview">
      <motion.span
        className="vault-hero-kicker"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        Personal lexicon
      </motion.span>
      <motion.h2
        className="vault-hero-title"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        VOCABVAULT
      </motion.h2>
      <motion.p
        className="vault-hero-tagline"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        Build a vocabulary worth remembering.
      </motion.p>

      {empty ? (
        <motion.div 
          className="empty-state vault-empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
        <div className="vault-hero-stats">
          {items.map((item, index) => (
            <motion.div
              className="vault-hero-stat"
              key={item.label}
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ 
                scale: 1.05, 
                y: -4,
                transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
              }}
              transition={{ duration: 0.48, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.small
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.08 }}
              >
                {item.label}
              </motion.small>
              <motion.strong
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <CountUp value={item.value} />
              </motion.strong>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
