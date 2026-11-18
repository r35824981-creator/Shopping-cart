import { useId } from 'react';
import styles from './formField.module.css';

/**
 * Labelled text input with inline validation.
 * @param {object} props
 */
export default function Input({ label, error, hint, id, className = '', ...rest }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className={`${styles.field} ${className}`}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        {...rest}
      />
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
