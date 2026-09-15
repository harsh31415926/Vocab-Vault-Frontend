import { motion } from 'motion/react';
import CountUp from './CountUp';
import { getVaultStats } from '../utils/vaultStats';
import { ChevronRight } from 'lucide-react';

export default function DashboardHero({ vocabularies = [], userId, onAddClick, onDailyChallengesClick }) {
  const stats = getVaultStats(vocabularies, userId);
  const empty = vocabularies.length === 0;

  return (
    <section className="vault-intelligence-section" aria-label="Vault overview">
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
        <div className="vault-intelligence-strip">
          <div className="vault-strip-left">
            <span className="vault-intelligence-label">VOCABULARY SNAPSHOT</span>
            <div className="vault-stats-inline">
              <span className="stat-value"><CountUp value={stats.words} /></span> <span className="stat-label">Words</span>
              <span className="stat-divider">·</span>
              <span className="stat-value"><CountUp value={stats.mastered} /></span> <span className="stat-label">Mastered</span>
              <span className="stat-divider">·</span>
              <span className="stat-value"><CountUp value={stats.revision} /></span> <span className="stat-label">To Revise</span>
              <span className="stat-divider">·</span>
              <span className="stat-value"><CountUp value={stats.favorites} /></span> <span className="stat-label">★</span>
            </div>
          </div>
          
          <div className="vault-strip-right">
             <div className="vault-insight-subtle">
               Keep building your lexicon
             </div>
             
             {onDailyChallengesClick && (
               <button 
                 className="vault-daily-compact-btn" 
                 onClick={onDailyChallengesClick}
               >
                 <span className="daily-streak-dot">◆</span>
                 Daily Practice Is Ready
                 <ChevronRight size={14} />
               </button>
             )}
          </div>
        </div>
      )}
    </section>
  );
}
