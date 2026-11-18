import { Truck } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { FREE_DELIVERY_THRESHOLD } from '../../utils/cart';
import styles from './CartSummary.module.css';

/**
 * Subtotal, delivery and total card.
 * @param {{ totals: object, title?: string, children?: React.ReactNode, note?: boolean }} props
 */
export default function CartSummary({ totals, title = 'Order summary', children, note = true }) {
  const remaining = FREE_DELIVERY_THRESHOLD - totals.subtotal;

  return (
    <aside className={styles.summary}>
      <h2 className={styles.title}>{title}</h2>

      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Subtotal</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Delivery</dt>
          <dd>{totals.delivery === 0 ? 'Free' : formatPrice(totals.delivery)}</dd>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <dt>Total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      {note && totals.subtotal > 0 && remaining > 0 ? (
        <p className={styles.note}>
          <Truck size={16} aria-hidden="true" />
          Add {formatPrice(remaining)} more for free delivery.
        </p>
      ) : null}

      <div className={styles.actions}>{children}</div>

      <p className={styles.cod}>
        <strong>Cash on Delivery</strong> is the only payment method. Pay when your order arrives.
      </p>
    </aside>
  );
}
