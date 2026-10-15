import { useId, useState } from 'react'
interface Props { value: number; onChange?: (value: number) => void; readOnly?: boolean; size?: number }
export default function StarRating({ value, onChange, readOnly = false, size = 20 }: Props) {
  const id = useId()
  const [hovered, setHovered] = useState(0)
  if (readOnly) return <span role="img" aria-label={'5점 중 ' + value + '점'} style={{ display:'inline-flex', gap:2, fontSize:size }}>{[1,2,3,4,5].map(star => <span key={star} aria-hidden="true" style={{ color:value >= star ? 'var(--accent)' : 'var(--border-4)' }}>★</span>)}</span>
  return <div className="star-picker" role="radiogroup" aria-label="별점">{[1,2,3,4,5].map(star => <label key={star} className="star-choice" onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}><input className="sr-only" type="radio" name={id} value={star} checked={value === star} aria-label={star + '점'} onChange={() => onChange?.(star)} /><span aria-hidden="true" style={{ color:(hovered || value) >= star ? 'var(--accent)' : 'var(--border-4)', fontSize:size }}>★</span></label>)}</div>
}