import ProductImage from '../product/ProductImage';
import { formatPrice } from '../../utils/format';
import styles from './OrderSummary.module.css';

/**
 * Read-only list of order lines with totals.
 * @param {{ items: Array<object>, totals: object, title?: string }} props
 */
export default function OrderSummary({ items, totals, title = 'Order summary' }) {
  return (
    <aside className={styles.summary}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.media}>
              <ProductImage src={item.image_url} name={item.name} className={styles.image} />
              <span className={styles.quantity}>{item.quantity}</span>
            </div>
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.meta}>Size {item.size}</p>
            </div>
            <p className={styles.price}>{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <dl className={styles.rows}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{totals.delivery === 0 ? 'Free' : formatPrice(totals.delivery)}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>
    </aside>
  );
}
