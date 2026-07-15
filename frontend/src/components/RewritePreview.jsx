export default function RewritePreview({ rewrite, onApply, onDiscard }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '0.5rem' }}>
      <h4>Original</h4>
      <p>{rewrite.originalText}</p>

      <h4>Rewritten</h4>
      <p>{rewrite.rewrittenText}</p>

      <button onClick={() => onApply(rewrite)}>Apply (Save Over Original)</button>
      <button onClick={onDiscard}>Discard</button>
    </div>
  );
}