'use client';

export default function TransactionItem({
  type = 'in',      // 'in' | 'out' | 'gold'
  icon,             // Optional override emoji
  title,
  subtitle,
  amount,
  date,
}) {
  const defaultIcons = {
    in: '↓',
    out: '↑',
    gold: '🛡️',
  };

  const displayIcon = icon || defaultIcons[type] || '•';

  return (
    <div className="txn-row">
      <div className={`txn-icon ${type}`}>{displayIcon}</div>
      <div className="txn-info">
        <div className="txn-title">{title}</div>
        {subtitle && <div className="txn-sub">{subtitle}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {amount !== undefined && amount !== null && (
          <div className={`txn-amount ${type}`}>{amount}</div>
        )}
        {date && (
          <div className="txn-sub" style={{ marginTop: 2 }}>{date}</div>
        )}
      </div>
    </div>
  );
}