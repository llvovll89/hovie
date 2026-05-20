interface Props {
  count?: number
}

function SingleSkeleton() {
  return (
    <div style={{ alignSelf: 'start' }}>
      <div
        className="skeleton"
        style={{ width: '100%', aspectRatio: '2/3', borderRadius: 2 }}
      />
      <div style={{ padding: '8px 2px 0' }}>
        <div className="skeleton" style={{ height: 13, borderRadius: 2, width: '80%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 11, borderRadius: 2, width: '40%' }} />
      </div>
    </div>
  )
}

export default function SkeletonCard({ count = 1 }: Props) {
  if (count === 1) return <SingleSkeleton />
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </>
  )
}
