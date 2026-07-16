import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import NoteEditor from '../components/NoteEditor';
import RewritePreview from '../components/RewritePreview';

// Mimics a real US Letter page (8.5in x 11in) so the layout resembles an
// actual physical allowed-notes sheet a student would print for an exam.
const pageStyle = {
  width: '8.5in',
  minHeight: '11in',
  margin: '1rem auto',
  padding: '0.5in',
  border: '1px solid #999',
  background: 'white',
  boxShadow: '0 0 8px rgba(0,0,0,0.15)',
};

export default function CheatsheetEditor() {
  const { cheatsheetId } = useParams();
  const [sheet, setSheet] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteLoadingSide, setRewriteLoadingSide] = useState(null);
  const [activeRewrite, setActiveRewrite] = useState(null); // { side, ...rewriteData }

  useEffect(() => {
    load();
  }, [cheatsheetId]);

  async function load() {
    const res = await api.get(`/cheatsheets/${cheatsheetId}`);
    setSheet(res.data);
  }

  async function save() {
    setSaving(true);
    await api.put(`/cheatsheets/${cheatsheetId}`, {
      frontContent: sheet.frontContent,
      backContent: sheet.backContent,
    });
    setSaving(false);
  }

  async function generateRewrite(side) {
    setRewriteLoadingSide(side);
    setRewriteError('');
    try {
      const res = await api.post('/rewrites/generate', { cheatsheetId, side });
      setActiveRewrite({ side, ...res.data });
    } catch (err) {
      setRewriteError(err.response?.data?.error || 'Failed to generate rewrite');
    } finally {
      setRewriteLoadingSide(null);
    }
  }

  async function applyRewrite(rewrite) {
    const field = rewrite.side === 'front' ? 'frontContent' : 'backContent';
    const html = `<p>${rewrite.rewrittenText.replace(/\n/g, '<br>')}</p>`;

    setSheet({ ...sheet, [field]: html });
    await api.put(`/cheatsheets/${cheatsheetId}`, { [field]: html });
    setActiveRewrite(null);
  }

  if (!sheet) return <p>Loading...</p>;

  return (
    <div>
      <Link to={`/subjects/${sheet.subject}/cheatsheets`}>&larr; Back to Cheat Sheets</Link>
      <h2>{sheet.title}</h2>
      <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>

      <h3>Side 1 (Front)</h3>
      <div style={pageStyle}>
        <NoteEditor
          value={sheet.frontContent}
          onChange={(html) => setSheet({ ...sheet, frontContent: html })}
          placeholder="Front side content..."
        />
      </div>
      <button onClick={() => generateRewrite('front')} disabled={rewriteLoadingSide === 'front'}>
        {rewriteLoadingSide === 'front' ? 'Rewriting...' : 'Rewrite Front for Clarity'}
      </button>

      <h3>Side 2 (Back)</h3>
      <div style={pageStyle}>
        <NoteEditor
          value={sheet.backContent}
          onChange={(html) => setSheet({ ...sheet, backContent: html })}
          placeholder="Back side content..."
        />
      </div>
      <button onClick={() => generateRewrite('back')} disabled={rewriteLoadingSide === 'back'}>
        {rewriteLoadingSide === 'back' ? 'Rewriting...' : 'Rewrite Back for Clarity'}
      </button>

      {rewriteError && <p style={{ color: 'red' }}>{rewriteError}</p>}
      {activeRewrite && (
        <RewritePreview
          rewrite={activeRewrite}
          onApply={applyRewrite}
          onDiscard={() => setActiveRewrite(null)}
        />
      )}
    </div>
  );
}