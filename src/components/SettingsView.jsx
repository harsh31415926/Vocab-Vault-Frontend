import React, { useEffect, useRef, useState } from 'react';
import { Download, Upload, Shield, Bell, Brain, Calendar, Info, Check } from 'lucide-react';

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function parseCsv(csvText) {
  const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    const split = (value, delimiter) => value.split(delimiter).map((item) => item.trim()).filter(Boolean);
    return {
      word: row.word,
      meaning: row.meaning,
      notes: row.notes,
      synonyms: split(row.synonyms || '', ';'),
      examples: split(row.examples || '', ';'),
      tags: split(row.tags || '', ','),
      is_favorite: ['yes', 'true', '1'].includes((row.favorite || '').toLowerCase()),
    };
  }).filter((entry) => entry.word && entry.meaning);
}

export default function SettingsView({ vocabularies, user, onImportVocabulary }) {
  const [reminders, setReminders] = useState(() => localStorage.getItem('vocab_vault_reminders') === 'true');
  const [spacedRep, setSpacedRep] = useState(() => localStorage.getItem('vocab_vault_spaced_rep') !== 'false');
  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('vocab_vault_reminders', String(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('vocab_vault_spaced_rep', String(spacedRep));
  }, [spacedRep]);

  const handleExportCSV = () => {
    if (vocabularies.length === 0) {
      setImportStatus('Your vault is empty; there is nothing to export.');
      return;
    }
    const headers = ['Word', 'Meaning', 'Notes', 'Synonyms', 'Examples', 'Tags', 'Favorite', 'Created At'];
    const rows = vocabularies.map((vocab) => [
      vocab.word || '', vocab.meaning || '', vocab.notes || '', (vocab.synonyms || []).join('; '),
      (vocab.examples || []).join('; '), (vocab.tags || []).join(', '), vocab.is_favorite ? 'Yes' : 'No', vocab.created_at || '',
    ].map((field) => `"${String(field).replace(/"/g, '""')}"`));
    const blob = new Blob([[headers.join(','), ...rows.map((row) => row.join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vocab_vault_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setImportStatus(`Exported ${vocabularies.length} ${vocabularies.length === 1 ? 'entry' : 'entries'}.`);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const entries = parseCsv(await file.text());
      if (!entries.length) {
        setImportStatus('No valid rows found. Include at least Word and Meaning columns.');
        return;
      }
      await onImportVocabulary?.(entries);
      setImportStatus(`Queued ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} for import.`);
    } catch {
      setImportStatus('This CSV could not be read. Please export a fresh template and try again.');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-intro"><span className="header-eyebrow">Vault controls</span><h2>Make the system yours.</h2><p>Thoughtful defaults, portable data, and no unnecessary ceremony.</p></div>

      <div className="settings-card">
        <h3 className="settings-section-title"><Shield size={16} /> Account & privacy</h3>
        <div className="setting-row"><div className="setting-info"><span className="setting-title">Authorized email</span><span className="setting-desc">The identity protecting your private collection.</span></div><span className="setting-value">{user?.email || 'user@example.com'}</span></div>
        <div className="setting-row"><div className="setting-info"><span className="setting-title">Vault connection</span><span className="setting-desc">Connected to the existing vocabulary service.</span></div><span className="setting-status"><span /> Active</span></div>
      </div>

      <div className="settings-card">
        <h3 className="settings-section-title"><Download size={16} /> Data portability</h3>
        <div className="setting-row"><div className="setting-info"><span className="setting-title">Export vocabulary</span><span className="setting-desc">Download your collection as a readable CSV backup.</span></div><button className="settings-action-btn" onClick={handleExportCSV}><Download size={14} /> Export CSV</button></div>
        <div className="setting-row"><div className="setting-info"><span className="setting-title">Import vocabulary</span><span className="setting-desc">Restore rows with Word and Meaning columns; optional fields are supported.</span></div><><input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} hidden /><button className="settings-action-btn" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Import CSV</button></></div>
        {importStatus && <div className="settings-feedback"><Check size={14} />{importStatus}</div>}
      </div>

      <div className="settings-card">
        <h3 className="settings-section-title"><Brain size={16} /> Practice preferences</h3>
        <div className="setting-row"><div className="setting-info"><div className="setting-title-with-icon"><Brain size={15} /><span>Spaced repetition</span></div><span className="setting-desc">Keep revision sessions oriented around active recall.</span></div><button className={`toggle-control ${spacedRep ? 'on' : ''}`} onClick={() => setSpacedRep((value) => !value)} role="switch" aria-checked={spacedRep} aria-label="Toggle spaced repetition"><span /></button></div>
        <div className="setting-row"><div className="setting-info"><div className="setting-title-with-icon"><Bell size={15} /><span>Daily word reminder</span></div><span className="setting-desc">A gentle nudge to return to the words you are building.</span></div><button className={`toggle-control ${reminders ? 'on' : ''}`} onClick={() => setReminders((value) => !value)} role="switch" aria-checked={reminders} aria-label="Toggle daily word reminder"><span /></button></div>
        <div className="setting-row"><div className="setting-info"><div className="setting-title-with-icon"><Calendar size={15} /><span>Learning rhythm</span></div><span className="setting-desc">Revision statistics and streaks are kept local to this interface.</span></div><span className="setting-badge"><Info size={12} /> Coming next</span></div>
      </div>
    </div>
  );
}
