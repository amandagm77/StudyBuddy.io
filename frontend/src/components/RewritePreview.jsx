export default function RewritePreview({ rewrite, onApply, onDiscard }) {
  return (
    <div className="card" style={{ marginTop: '1rem', background: 'var(--color-bg)' }}>
      <h4 style={{ marginBottom: '0.25rem' }}>Original</h4>
      <p className="muted" style={{ marginTop: 0 }}>{rewrite.originalText}</p>

      <h4 style={{ marginBottom: '0.25rem' }}>Rewritten</h4>
      <p style={{ marginTop: 0 }}>{rewrite.rewrittenText}</p>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={() => onApply(rewrite)}>
          Apply (Save Over Original)
        </button>
        <button className="btn btn-secondary" onClick={onDiscard}>
          Discard
        </button>
      </div>
    </div>
  );
}