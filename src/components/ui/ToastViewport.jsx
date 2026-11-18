import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import styles from './ToastViewport.module.css';

/**
 * Fixed stack of toast messages.
 * @param {{ toasts: Array<{id: string, message: string, type: string}>, onDismiss: Function }} props
 */
export default function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.viewport} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = toast.type === 'error' ? AlertCircle : CheckCircle2;
        return (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type] || ''}`} role="status">
            <Icon size={20} aria-hidden="true" />
            <p className={styles.message}>{toast.message}</p>
            <button
              type="button"
              className={styles.close}
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
