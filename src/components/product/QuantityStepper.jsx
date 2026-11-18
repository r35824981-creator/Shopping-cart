import { Minus, Plus } from 'lucide-react';
import styles from './QuantityStepper.module.css';

/**
 * Quantity stepper with bounds and an accessible label.
 * @param {{ value: number, onChange: Function, min?: number, max?: number, disabled?: boolean, label?: string }} props
 */
export default function QuantityStepper({ value, onChange, min = 1, max = 99, disabled = false, label = 'Quantity' }) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.button}
        onClick={decrease}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={increase}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
