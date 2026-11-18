import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import ToastViewport from '../components/ui/ToastViewport';

const ToastContext = createContext(null);

/**
 * Provides toast notifications for the whole app.
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
      setToasts((current) => [...current, { id, message, type }]);
      const timer = window.setTimeout(() => dismiss(id), 4000);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      push,
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * Access the toast helpers.
 * @returns {{ push: Function, success: Function, error: Function, dismiss: Function }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
