import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function FavoriteButton({
  isFavorite,
  onToggle,
  size = 16,
  className = '',
  title,
}) {
  const [burst, setBurst] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    if (!isFavorite) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 520);
    }
    onToggle();
  };

  return (
    <button
      type="button"
      className={`card-action-btn favorite-trigger ${isFavorite ? 'favorite' : ''} ${className}`}
      onClick={handleClick}
      title={title}
      aria-pressed={isFavorite}
      aria-label={title}
    >
      {burst && (
        <span className="favorite-burst" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <i key={index} style={{ '--i': index }} />)}
        </span>
      )}
      <motion.span
        className="favorite-star"
        animate={isFavorite ? { scale: [1, 1.28, 1], rotate: [0, -18, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <Star size={size} fill={isFavorite ? 'var(--favorite-color)' : 'none'} />
      </motion.span>
    </button>
  );
}
