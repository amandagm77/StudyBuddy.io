import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SubjectNav from '../components/SubjectNav';
import NoteEditor from '../components/NoteEditor';
import RewritePreview from '../components/RewritePreview';
import { Sparkles } from 'lucide-react';

const pageStyle = {
  width: '8.5in',
  maxWidth: '100%',
  minHeight: '11in',
  margin: '1rem auto',
  padding: '0.5in',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  boxShadow: 'var(--shadow-md)',
};

export default function CheatsheetEditor() {
  const { cheatsheetId } = useParams();
  const [sheet, setSheet] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteLoadingSide, setRewriteLoadingSide] = useState(null);
  const [activeRewrite, setActiveRewrite] = useState(null);

  useEffect(() => {
    load();
  }, [cheatsheetId]);

  async function load() {
    const res = await api.get(`/cheatsheets/${cheatsheetId}`);
    setSheet(res.data);
    const subjectRes = await api.get(`/subjects/${res.data.subject}`);
    setSubjectTitle(subjectRes.data.title);
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

  if (!sheet) return <div><Navbar /><div className="container"><p>Loading...</p></div></div>;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <SubjectNav subjectId={sheet.subject} subjectTitle={subjectTitle} />

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginBottom: 0, minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{sheet.title}</h3>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <h4 id="cheatsheet-front-heading" style={{ marginTop: '1.5rem' }}>Side 1 (Front)</h4>
          <div style={pageStyle} role="group" aria-labelledby="cheatsheet-front-heading">
            <NoteEditor
              value={sheet.frontContent}
              onChange={(html) => setSheet({ ...sheet, frontContent: html })}
              placeholder="Front side content..."
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => generateRewrite('front')}
            disabled={rewriteLoadingSide === 'front'}
          >
            <Sparkles size={16} className="ai-icon" aria-hidden="true" />
            {rewriteLoadingSide === 'front' ? 'Rewriting...' : 'Rewrite Front for Clarity'}
          </button>
          {activeRewrite?.side === 'front' && (
            <RewritePreview
              rewrite={activeRewrite}
              onApply={applyRewrite}
              onDiscard={() => setActiveRewrite(null)}
            />
          )}

          <h4 id="cheatsheet-back-heading" style={{ marginTop: '2rem' }}>Side 2 (Back)</h4>
          <div style={pageStyle} role="group" aria-labelledby="cheatsheet-back-heading">
            <NoteEditor
              value={sheet.backContent}
              onChange={(html) => setSheet({ ...sheet, backContent: html })}
              placeholder="Back side content..."
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => generateRewrite('back')}
            disabled={rewriteLoadingSide === 'back'}
          >
            <Sparkles size={16} className="ai-icon" aria-hidden="true" />
            {rewriteLoadingSide === 'back' ? 'Rewriting...' : 'Rewrite Back for Clarity'}
          </button>
          {activeRewrite?.side === 'back' && (
            <RewritePreview
              rewrite={activeRewrite}
              onApply={applyRewrite}
              onDiscard={() => setActiveRewrite(null)}
            />
          )}

          {rewriteError && <p className="error-text">{rewriteError}</p>}
        </div>
      </div>
    </div>
  );
}