import styles from './Skeleton.module.css';

/**
 * Neutral placeholder block used while data loads.
 * @param {{ width?: string, height?: string, radius?: string, className?: string }} props
 */
export default function Skeleton({ width = '100%', height = '16px', radius = 'var(--radius-sm)', className = '' }) {
  return (
    <span
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
