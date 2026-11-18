import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import ProductImage from '../product/ProductImage';
import QuantityStepper from '../product/QuantityStepper';
import { formatPrice } from '../../utils/format';
import styles from './CartLine.module.css';

/**
 * One editable cart row.
 * @param {object} props
 */
export default function CartLine({ item, onQuantityChange, onRemove, busy = false }) {
  return (
    <article className={styles.line}>
      <Link to={`/products/${item.slug}`} className={styles.media} aria-label={`View ${item.name}`}>
        <ProductImage src={item.image_url} name={item.name} className={styles.image} />
      </Link>

      <div className={styles.details}>
        <div className={styles.top}>
          <div className={styles.info}>
            <Link to={`/products/${item.slug}`} className={styles.name}>
              {item.name}
            </Link>
            <p className={styles.meta}>
              Size {item.size} · {formatPrice(item.price)} each
            </p>
            {!item.is_active ? <p className={styles.warning}>This product is no longer available.</p> : null}
          </div>
          <p className={styles.lineTotal}>{formatPrice(item.price * item.quantity)}</p>
        </div>

        <div className={styles.actions}>
          <QuantityStepper
            value={item.quantity}
            max={Math.max(item.quantity, item.stock, 1)}
            disabled={busy}
            onChange={(next) => onQuantityChange(item.id, next)}
            label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove(item.id)}
            disabled={busy}
          >
            <Trash2 size={16} aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
