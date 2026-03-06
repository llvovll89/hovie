import { useState } from 'react'

interface Props {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: number
}

export default function StarRating({ value, onChange, readOnly = false, size = 20 }: Props) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const active = (hovered || value) >= star
        return (
          <button key={star} type="button" disabled={readOnly} onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            style={{ background: 'none', border: 'none', cursor: readOnly ? 'default' : 'pointer', padding: 1, color: active ? 'var(--accent)' : 'rgba(255,255,255,0.2)', fontSize: size, lineHeight: 1, transition: 'color 0.15s' }}
          >★</button>
        )
      })}
    </div>
  )
}
