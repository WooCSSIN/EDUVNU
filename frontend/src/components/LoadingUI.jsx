/**
 * EduVNU Shared UI Components
 * - Loading: Spinner + message
 * - SkeletonCard: Placeholder while loading courses
 * - SkeletonLine: Text placeholder
 */

export function Loading({ message = 'Đang tải...' }) {
  return (
    <div className="eduvnu-loading">
      <div className="eduvnu-spinner" />
      <span>{message}</span>
    </div>
  );
}

export function SkeletonCard({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-thumb skeleton-pulse" />
          <div className="skeleton-body">
            <div className="skeleton-line skeleton-pulse" style={{ width: '40%', height: 12 }} />
            <div className="skeleton-line skeleton-pulse" style={{ width: '90%', height: 16 }} />
            <div className="skeleton-line skeleton-pulse" style={{ width: '70%', height: 16 }} />
            <div className="skeleton-line skeleton-pulse" style={{ width: '55%', height: 12, marginTop: 'auto' }} />
          </div>
        </div>
      ))}
    </>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton-avatar skeleton-pulse" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton-line skeleton-pulse" style={{ width: '80%', height: 14 }} />
            <div className="skeleton-line skeleton-pulse" style={{ width: '50%', height: 12 }} />
          </div>
          <div className="skeleton-line skeleton-pulse" style={{ width: 60, height: 16 }} />
        </div>
      ))}
    </div>
  );
}
