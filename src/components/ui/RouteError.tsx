import { Link, useRouteError, useNavigate } from 'react-router-dom'

export default function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()

  if (import.meta.env.DEV) console.error(error)

  return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
      <p style={{ color: 'var(--text-3)', fontSize: 16, marginBottom: 4 }}>페이지를 표시하는 중 오류가 발생했습니다.</p>
      <p style={{ color: 'var(--text-4)', fontSize: 13 }}>잠시 후 다시 시도해 주세요.</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
        <button
          onClick={() => navigate(0)}
          style={{ background: 'var(--accent)', border: 'none', color: 'var(--accent-on)', padding: '10px 24px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
        >
          새로고침
        </button>
        <Link
          to="/"
          style={{ border: '1px solid var(--border-4)', color: 'var(--text)', padding: '10px 24px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          홈으로
        </Link>
      </div>
    </div>
  )
}
