import React, { useState, useRef, useEffect } from 'react';
import { FileDown, ChevronDown, BookOpen, Star, Hash, Clock3 } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ExportPDF({ vocabularies, activeTag, activeView }) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const getExportSets = () => {
    const sets = [];
    sets.push({
      id: 'all',
      label: 'All Vocabulary',
      icon: BookOpen,
      count: vocabularies.length,
      words: vocabularies,
    });

    const favs = vocabularies.filter((v) => v.is_favorite);
    if (favs.length > 0) {
      sets.push({
        id: 'favorites',
        label: 'Favorites',
        icon: Star,
        count: favs.length,
        words: favs,
      });
    }

    if (activeTag) {
      const tagged = vocabularies.filter((v) => v.tags && v.tags.includes(activeTag));
      if (tagged.length > 0) {
        sets.push({
          id: 'tag',
          label: `#${activeTag}`,
          icon: Hash,
          count: tagged.length,
          words: tagged,
        });
      }
    }

    const recent = [...vocabularies]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20);
    if (recent.length > 0) {
      sets.push({
        id: 'recent',
        label: 'Recently Added',
        icon: Clock3,
        count: recent.length,
        words: recent,
      });
    }

    return sets;
  };

  // ── PDF Generation ────────────────────────────────────────
  const generatePDF = async (words, sectionLabel) => {
    if (!words || words.length === 0) return;
    setGenerating(true);
    setIsOpen(false);

    // Small delay so the UI can update to show loading state
    await new Promise((r) => setTimeout(r, 50));

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginL = 22;
      const marginR = 22;
      const contentW = pageW - marginL - marginR;
      const bottomMargin = 28;

      const ACCENT = [0, 180, 170];   // Cyan/teal
      const DARK   = [22, 27, 34];
      const MID    = [120, 130, 145];
      const LABEL  = [90, 100, 115];
      const TEXT   = [50, 55, 65];

      let pageNum = 0;

      const addFooter = () => {
        pageNum++;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MID);
        doc.text('VocabVault — Personal Lexicon', marginL, pageH - 10);
        doc.text(String(pageNum), pageW - marginR, pageH - 10, { align: 'right' });
      };

      const ensureSpace = (needed, y) => {
        if (y + needed > pageH - bottomMargin) {
          addFooter();
          doc.addPage();
          return 22;
        }
        return y;
      };

      // ── Cover / Title Area ─────────────────────────────────
      let y = 48;

      // Accent bar at top
      doc.setFillColor(...ACCENT);
      doc.rect(0, 0, pageW, 2.5, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(...DARK);
      doc.text('VOCABVAULT', marginL, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...MID);
      doc.text('Personal Lexicon', marginL, y);
      y += 6;

      // Section label
      doc.setFontSize(9);
      doc.setTextColor(...ACCENT);
      doc.text(`${sectionLabel}  ·  ${words.length} ${words.length === 1 ? 'entry' : 'entries'}`, marginL, y);
      y += 4;

      // Divider
      doc.setDrawColor(...ACCENT);
      doc.setLineWidth(0.4);
      doc.line(marginL, y, pageW - marginR, y);
      y += 12;

      // ── Word Entries ───────────────────────────────────────
      const sortedWords = [...words].sort((a, b) => (a.word || '').localeCompare(b.word || ''));

      for (let i = 0; i < sortedWords.length; i++) {
        const vocab = sortedWords[i];

        // Estimate needed height (rough): word + meaning + fields
        y = ensureSpace(38, y);

        // Word heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...DARK);
        const wordText = (vocab.word || '').toUpperCase();
        doc.text(wordText, marginL, y);
        y += 1.5;

        // Small accent underline below word
        const wordWidth = Math.min(doc.getTextWidth(wordText), contentW * 0.5);
        doc.setDrawColor(...ACCENT);
        doc.setLineWidth(0.5);
        doc.line(marginL, y, marginL + wordWidth, y);
        y += 6;

        // Meaning
        if (vocab.meaning) {
          y = ensureSpace(10, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...TEXT);
          const meaningLines = doc.splitTextToSize(vocab.meaning, contentW);
          meaningLines.forEach((line) => {
            y = ensureSpace(5, y);
            doc.text(line, marginL, y);
            y += 4.5;
          });
          y += 1;
        }

        // Synonyms
        const synonyms = Array.isArray(vocab.synonyms) ? vocab.synonyms.filter(Boolean) : [];
        if (synonyms.length > 0) {
          y = ensureSpace(8, y);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(...LABEL);
          doc.text('SYNONYMS', marginL, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...TEXT);
          const synText = synonyms.join(', ');
          const synLines = doc.splitTextToSize(synText, contentW);
          synLines.forEach((line) => {
            y = ensureSpace(5, y);
            doc.text(line, marginL, y);
            y += 4.2;
          });
          y += 1;
        }

        // Examples
        const examples = Array.isArray(vocab.examples) ? vocab.examples.filter(Boolean) : [];
        if (examples.length > 0) {
          y = ensureSpace(8, y);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(...LABEL);
          doc.text('EXAMPLES', marginL, y);
          y += 4;
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(...TEXT);
          examples.forEach((ex) => {
            const exLines = doc.splitTextToSize(`"${ex}"`, contentW);
            exLines.forEach((line) => {
              y = ensureSpace(5, y);
              doc.text(line, marginL, y);
              y += 4.2;
            });
            y += 0.8;
          });
          y += 0.5;
        }

        // Notes
        if (vocab.notes && vocab.notes.trim()) {
          y = ensureSpace(8, y);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(...LABEL);
          doc.text('NOTES', marginL, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...TEXT);
          const noteLines = doc.splitTextToSize(vocab.notes, contentW);
          noteLines.forEach((line) => {
            y = ensureSpace(5, y);
            doc.text(line, marginL, y);
            y += 4.2;
          });
          y += 1;
        }

        // Tags
        const tags = Array.isArray(vocab.tags) ? vocab.tags.filter(Boolean) : [];
        if (tags.length > 0) {
          y = ensureSpace(8, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(...ACCENT);
          doc.text(tags.map((t) => `#${t}`).join('  '), marginL, y);
          y += 3;
        }

        // Separator between entries
        if (i < sortedWords.length - 1) {
          y += 3;
          y = ensureSpace(6, y);
          doc.setDrawColor(210, 215, 222);
          doc.setLineWidth(0.15);
          doc.line(marginL, y, pageW - marginR, y);
          y += 8;
        }
      }

      // Final footer on last page
      addFooter();

      // Trigger download
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeName = sectionLabel.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
      doc.save(`VocabVault_${safeName}_${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const exportSets = getExportSets();

  if (vocabularies.length === 0) return null;

  return (
    <div className="export-pdf-wrapper" ref={menuRef}>
      <button
        className={`export-pdf-trigger ${generating ? 'is-generating' : ''}`}
        onClick={() => !generating && setIsOpen((prev) => !prev)}
        title="Export vocabulary as PDF"
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={generating}
      >
        <FileDown size={15} />
        <span>{generating ? 'Generating…' : 'Export'}</span>
        {!generating && <ChevronDown size={13} className={`export-chevron ${isOpen ? 'rotated' : ''}`} />}
      </button>

      {isOpen && (
        <div className="export-pdf-dropdown" role="menu">
          <div className="export-dropdown-header">Export as PDF</div>
          {exportSets.map((set) => {
            const Icon = set.icon;
            return (
              <button
                key={set.id}
                className="export-dropdown-item"
                role="menuitem"
                onClick={() => generatePDF(set.words, set.label)}
              >
                <Icon size={14} />
                <span className="export-item-label">{set.label}</span>
                <span className="export-item-count">{set.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
