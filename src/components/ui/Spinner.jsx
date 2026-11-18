import styles from './Spinner.module.css';

/**
 * Small circular loading indicator.
 * @param {{ size?: number, className?: string }} props
 */
export default function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={`${styles.spinner} ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
