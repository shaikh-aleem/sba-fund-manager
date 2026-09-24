'use client';

export default function TransactionItem({
  type = 'in',
  icon,
  title,
  subtitle,
  amount,
  date,
}) {
  // Fallback arrow if no icon provided
  const displayIcon = icon || (type === 'in' ? '↓' : type === 'out' ? '↑' : '•');

  return (
    <div className="txn-row">
      <div className={`txn-icon ${type}`}>{displayIcon}</div>
      <div className="txn-info">
        <div className="txn-title">{title}</div>
        {subtitle && <div className="txn-sub">{subtitle}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {amount && <div className={`txn-amount ${type}`}>{amount}</div>}
        {date && <div className="txn-sub" style={{ marginTop: 2 }}>{date}</div>}
      </div>
    </div>
  );
}