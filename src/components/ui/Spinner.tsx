export default function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div role="status" aria-label="불러오는 중" style={{ width: size, height: size, border: '2px solid var(--border-2)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
