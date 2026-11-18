import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PackageSearch, ShoppingBag } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import ProductImage from '../components/product/ProductImage';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fetchMyOrders } from '../services/orderService';
import { formatDate, formatOrderNumber, formatPrice } from '../utils/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT } from '../lib/constants';
import styles from './Orders.module.css';

/** The signed-in user's order history. */
export default function Orders() {
  useDocumentTitle('My orders');
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchMyOrders(user.id)
      .then((items) => {
        if (active) setOrders(items);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load your orders.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user.id]);

  return (
    <div className="container">
      <header className="pageHeader">
        <div className={styles.heading}>
          <p className="eyebrow">Account</p>
          <h1 className={styles.title}>My orders</h1>
          <p className={styles.subtitle}>Track what you have ordered and how it is doing.</p>
        </div>
        <Link to="/products" className={styles.continue}>
          Shop again
        </Link>
      </header>

      {loading ? (
        <div className={styles.cards}>
          {[1, 2].map((key) => (
            <div key={key} className={styles.skeleton}>
              <Skeleton width="30%" height="14px" />
              <Skeleton width="100%" height="72px" />
              <Skeleton width="20%" height="14px" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={PackageSearch} tone="error" title="Could not load your orders" description={error} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Your first pair is waiting. Browse the collection to get started."
        >
          <Button to="/products" icon={ArrowRight} iconAfter>
            Browse sneakers
          </Button>
        </EmptyState>
      ) : (
        <div className={styles.cards}>
          {orders.map((order) => {
            const itemCount = order.order_items.reduce((total, item) => total + item.quantity, 0);
            return (
              <article key={order.id} className={styles.card}>
                <header className={styles.cardHead}>
                  <div>
                    <p className={styles.orderNumber}>{formatOrderNumber(order.id)}</p>
                    <p className={styles.date}>Placed on {formatDate(order.created_at)}</p>
                  </div>
                  <Badge variant={ORDER_STATUS_VARIANT[order.status] || 'neutral'}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </header>

                <div className={styles.cardBody}>
                  <div className={styles.thumbs}>
                    {order.order_items.slice(0, 4).map((item) => (
                      <ProductImage
                        key={item.id}
                        src={item.image_url}
                        name={item.product_name}
                        className={styles.thumb}
                      />
                    ))}
                    {order.order_items.length > 4 ? (
                      <span className={styles.more}>+{order.order_items.length - 4}</span>
                    ) : null}
                  </div>

                  <div className={styles.cardMeta}>
                    <p className={styles.itemCount}>
                      {itemCount} item{itemCount === 1 ? '' : 's'}
                    </p>
                    <p className={styles.total}>{formatPrice(order.total_amount)}</p>
                  </div>
                </div>

                <footer className={styles.cardFoot}>
                  <Link to={`/orders/${order.id}`} className={styles.detailsLink}>
                    View details
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
