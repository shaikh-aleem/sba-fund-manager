'use client';

export default function StatCard({
  label,
  value,
  sub,
  icon,
  variant = 'default', // 'default' | 'primary' | 'gold' | 'success' | 'danger'
  compact = false,
}) {
  return (
    <div className={`stat-card-new ${variant} ${compact ? 'compact' : ''}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-label-new">{label}</div>
      <div className="stat-value-new">{value}</div>
      {sub && <div className="stat-sub-new">{sub}</div>}
    </div>
  );
}