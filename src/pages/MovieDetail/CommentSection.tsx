import { useState, useEffect, FormEvent } from 'react'
import type { User } from 'firebase/auth'
import { addComment, getComments, addTVComment, getTVComments, isFirebaseConfigured } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../contexts/AuthModalContext'
import StarRating from '../../components/ui/StarRating'
import Spinner from '../../components/ui/Spinner'
import type { Comment } from '../../types'

const A = 'var(--accent)'
const AO = 'var(--accent-on)'

interface Props { movieId: number; mediaType?: 'movie' | 'tv' }

export default function CommentSection({ movieId, mediaType = 'movie' }: Props) {
  const getCommentsFn = mediaType === 'tv' ? getTVComments : getComments
  const addCommentFn = mediaType === 'tv' ? addTVComment : addComment
  const { user, loading: authLoading } = useAuth()
  const { openSignIn } = useAuthModal()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getCommentsFn(movieId).then(setComments).catch(console.error).finally(() => setLoading(false))
  }, [movieId, mediaType]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !content.trim() || rating === 0) return
    setSubmitting(true)
    setError(null)
    try {
      await addCommentFn(movieId, user as User, content.trim(), rating)
      const updated = await getComments(movieId)
      setComments(updated)
      setContent('')
      setRating(0)
    } catch {
      setError('댓글 등록에 실패했습니다. 다시 시도해주세요.')
    } finally { setSubmitting(false) }
  }

  if (!isFirebaseConfigured) {
    return (
      <div style={{ padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-4)', fontSize: 13, margin: 0 }}>💬 Firebase 설정 후 댓글 기능이 활성화됩니다.</p>
        <p style={{ color: 'var(--text-5)', fontSize: 11, margin: '8px 0 0' }}>.env 파일에 VITE_FIREBASE_* 환경 변수를 추가하세요.</p>
      </div>
    )
  }

  const avgRating = comments.length > 0
    ? (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1)
    : null

  return (
    <div>
      {avgRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '16px 20px', border: '1px solid rgba(0,153,255,0.2)', backgroundColor: 'rgba(0,153,255,0.04)' }}>
          <span style={{ color: A, fontSize: 28, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{avgRating}</span>
          <div>
            <StarRating value={Math.round(Number(avgRating))} readOnly size={16} />
            <p style={{ color: 'var(--text-4)', fontSize: 11, margin: '4px 0 0' }}>{comments.length}개의 리뷰</p>
          </div>
        </div>
      )}

      {authLoading ? null : user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 36, padding: '24px', border: '1px solid var(--border-2)', backgroundColor: 'var(--bg-hover)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />}
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{user.displayName ?? user.email}</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-4)', marginBottom: 8, textTransform: 'uppercase' }}>별점</p>
            <StarRating value={rating} onChange={setRating} size={22} />
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="이 영화에 대한 감상을 남겨주세요..."
            rows={4}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text)', padding: '12px 16px', fontSize: 14, lineHeight: 1.65, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
          />

          {error && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '8px 0 0' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              type="submit"
              disabled={submitting || !content.trim() || rating === 0}
              style={{ backgroundColor: submitting || !content.trim() || rating === 0 ? 'rgba(0,153,255,0.35)' : A, color: AO, border: 'none', padding: '10px 24px', fontSize: 11, letterSpacing: '0.18em', fontWeight: 600, cursor: submitting || !content.trim() || rating === 0 ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {submitting && <Spinner size={14} />}
              리뷰 등록
            </button>
          </div>
        </form>
      ) : (
        <div style={{ marginBottom: 36, padding: '24px', border: '1px solid var(--border-2)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 16 }}>리뷰를 남기려면 로그인이 필요합니다.</p>
          <button
            onClick={openSignIn}
            style={{ backgroundColor: A, color: AO, border: 'none', padding: '10px 24px', fontSize: 11, letterSpacing: '0.18em', fontWeight: 600, cursor: 'pointer' }}
          >
            로그인하기
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner /></div>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-4)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
          아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const date = new Date(comment.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {comment.userPhotoURL ? (
          <img src={comment.userPhotoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text)' }}>
            {comment.userDisplayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{comment.userDisplayName}</p>
          <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '2px 0 0' }}>{date}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StarRating value={comment.rating} readOnly size={14} />
        </div>
      </div>
      <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
        {comment.content}
      </p>
    </div>
  )
}
