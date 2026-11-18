import { useId } from 'react';
import styles from './formField.module.css';

/**
 * Labelled textarea with inline validation.
 * @param {object} props
 */
export default function Textarea({ label, error, hint, id, rows = 4, className = '', ...rest }) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const messageId = `${textareaId}-message`;

  return (
    <div className={`${styles.field} ${className}`}>
      {label ? (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        rows={rows}
        className={`${styles.control} ${styles.textarea} ${error ? styles.invalid : ''}`}
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
