import styles from './Badge.module.css';

/**
 * Small status or label pill.
 * @param {{ children: React.ReactNode, variant?: string, className?: string }} props
 */
export default function Badge({ children, variant = 'neutral', className = '' }) {
  return <span className={`${styles.badge} ${styles[variant]} ${className}`}>{children}</span>;
}
