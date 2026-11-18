import styles from './SizeSelector.module.css';

/**
 * Pill size picker. Sizes with no stock are disabled.
 * @param {{ sizes: Array<{size: string, stock: number}>, value: string, onChange: Function, error?: string }} props
 */
export default function SizeSelector({ sizes = [], value, onChange, error }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <span className={styles.label}>Select size</span>
        <span className={styles.unit}>UK sizing</span>
      </div>
      <div className={styles.sizes} role="group" aria-label="Available sizes">
        {sizes.map(({ size, stock }) => {
          const available = stock > 0;
          return (
            <button
              key={size}
              type="button"
              className={`${styles.size} ${value === size ? styles.selected : ''}`}
              aria-pressed={value === size}
              disabled={!available}
              onClick={() => onChange(size)}
              title={available ? `${stock} in stock` : 'Out of stock'}
            >
              {size.replace('UK ', '')}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
