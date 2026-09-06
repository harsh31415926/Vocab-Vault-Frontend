export function readRevisionStats(userId) {
  try {
    return JSON.parse(localStorage.getItem(`vocab_vault_revision_stats_${userId || 'guest'}`) || '{"days":{},"words":{}}');
  } catch {
    return { days: {}, words: {} };
  }
}

export function getVaultStats(vocabularies = [], userId) {
  const words = vocabularies.length;
  const favorites = vocabularies.filter((vocab) => vocab.is_favorite).length;
  const wordStats = readRevisionStats(userId).words || {};

  let mastered = 0;
  let revision = 0;

  vocabularies.forEach((vocab) => {
    const stats = wordStats[vocab.id] || wordStats[String(vocab.id)];
    if (!stats) return;
    const reviewed = stats.reviewed || 0;
    const wrong = stats.wrong || 0;
    const hard = stats.hard || 0;
    if (reviewed > 0 && wrong === 0) mastered += 1;
    if (wrong > 0 || hard > 0) revision += 1;
  });

  return { words, favorites, mastered, revision };
}
