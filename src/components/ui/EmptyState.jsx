import styles from './EmptyState.module.css';

/**
 * Friendly empty or error state with an optional action.
 * @param {{ icon?: React.ComponentType, title: string, description?: string, children?: React.ReactNode, tone?: string }} props
 */
export default function EmptyState({ icon: Icon, title, description, children, tone = 'neutral' }) {
  return (
    <div className={`${styles.empty} ${styles[tone]}`}>
      {Icon ? (
        <span className={styles.icon}>
          <Icon size={24} aria-hidden="true" />
        </span>
      ) : null}
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children ? <div className={styles.actions}>{children}</div> : null}
    </div>
  );
}
