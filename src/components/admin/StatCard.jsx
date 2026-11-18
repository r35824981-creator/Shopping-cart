import styles from './StatCard.module.css';

/**
 * Small admin metric card.
 * @param {{ label: string, value: string, hint?: string, icon: React.ComponentType, tone?: string }} props
 */
export default function StatCard({ label, value, hint, icon: Icon, tone = 'neutral' }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <p className={styles.label}>{label}</p>
        <span className={`${styles.icon} ${styles[tone]}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className={styles.value}>{value}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}
