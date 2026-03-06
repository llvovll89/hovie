import { useState, useEffect, FormEvent } from 'react'
import type { User } from 'firebase/auth'
import { addComment, getComments, signInWithGoogle, isFirebaseConfigured } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'
import StarRating from '../../components/ui/StarRating'
import Spinner from '../../components/ui/Spinner'
import type { Comment } from '../../types'

interface Props {
  movieId: number
}

export default function CommentSection({ movieId }: Props) {
  const { user, loading: authLoading } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getComments(movieId)
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [movieId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !content.trim() || rating === 0) return

    setSubmitting(true)
    setError(null)
    try {
      await addComment(movieId, user as User, content.trim(), rating)
      const updated = await getComments(movieId)
      setComments(updated)
      setContent('')
      setRating(0)
    } catch {
      setError('댓글 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 2, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
          💬 Firebase 설정 후 댓글 기능이 활성화됩니다.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: '8px 0 0' }}>
          .env 파일에 VITE_FIREBASE_* 환경 변수를 추가하세요.
        </p>
      </div>
    )
  }

  const avgRating = comments.length > 0
    ? (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1)
    : null

  return (
    <div>
      {/* Average rating */}
      {avgRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '16px 20px', border: '1px solid rgba(201,168,76,0.2)', backgroundColor: 'rgba(201,168,76,0.04)' }}>
          <span style={{ color: '#C9A84C', fontSize: 28, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{avgRating}</span>
          <div>
            <StarRating value={Math.round(Number(avgRating))} readOnly size={16} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '4px 0 0' }}>{comments.length}개의 리뷰</p>
          </div>
        </div>
      )}

      {/* Write comment */}
      {authLoading ? null : user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 36, padding: '24px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {user.photoURL && (
              <img src={user.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            )}
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{user.displayName ?? user.email}</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase' }}>별점</p>
            <StarRating value={rating} onChange={setRating} size={22} />
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="이 영화에 대한 감상을 남겨주세요..."
            rows={4}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '12px 16px',
              fontSize: 14,
              lineHeight: 1.65,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
          />

          {error && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '8px 0 0' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              type="submit"
              disabled={submitting || !content.trim() || rating === 0}
              style={{
                backgroundColor: submitting || !content.trim() || rating === 0 ? 'rgba(201,168,76,0.4)' : '#C9A84C',
                color: '#000',
                border: 'none',
                padding: '10px 24px',
                fontSize: 11,
                letterSpacing: '0.18em',
                fontWeight: 600,
                cursor: submitting || !content.trim() || rating === 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {submitting && <Spinner size={14} />}
              리뷰 등록
            </button>
          </div>
        </form>
      ) : (
        <div style={{ marginBottom: 36, padding: '24px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 16 }}>
            리뷰를 남기려면 로그인이 필요합니다.
          </p>
          <button
            onClick={signInWithGoogle}
            style={{
              backgroundColor: '#C9A84C',
              color: '#000',
              border: 'none',
              padding: '10px 24px',
              fontSize: 11,
              letterSpacing: '0.18em',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Google로 로그인
          </button>
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
          아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const date = new Date(comment.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {comment.userPhotoURL ? (
          <img src={comment.userPhotoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff' }}>
            {comment.userDisplayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: 0 }}>{comment.userDisplayName}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{date}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StarRating value={comment.rating} readOnly size={14} />
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
        {comment.content}
      </p>
    </div>
  )
}
