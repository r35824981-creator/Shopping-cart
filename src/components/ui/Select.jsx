import { useId } from 'react';
import styles from './formField.module.css';

/**
 * Labelled select with inline validation.
 * @param {object} props
 */
export default function Select({ label, error, hint, id, children, className = '', ...rest }) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const messageId = `${selectId}-message`;

  return (
    <div className={`${styles.field} ${className}`}>
      {label ? (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`${styles.control} ${styles.select} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p id={messageId} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
