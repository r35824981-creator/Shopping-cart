import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, PackageX, Truck } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import ProductImage from '../components/product/ProductImage';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fetchOrder } from '../services/orderService';
import { formatDateTime, formatOrderNumber, formatPrice } from '../utils/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT } from '../lib/constants';
import styles from './OrderDetail.module.css';

const TRACKING_STEPS = [
  { status: 'pending', label: 'Order placed', copy: 'We received your Cash on Delivery order.' },
  { status: 'confirmed', label: 'Confirmed', copy: 'The store has accepted your order.' },
  { status: 'shipped', label: 'Shipped', copy: 'Your pair is on the way.' },
  { status: 'delivered', label: 'Delivered', copy: 'Enjoy the new kicks.' },
];

/** One order with items, delivery details and status tracking. */
export default function OrderDetail() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const justPlaced = searchParams.get('placed') === '1';

  useDocumentTitle(order ? formatOrderNumber(order.id) : 'Order');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchOrder(orderId, { userId: user.id, isAdmin })
      .then((next) => {
        if (active) setOrder(next);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load this order.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, user.id, isAdmin]);

  if (loading) {
    return (
      <div className="container">
        <div className={styles.skeleton}>
          <Skeleton width="30%" height="14px" />
          <Skeleton width="60%" height="36px" />
          <Skeleton width="100%" height="220px" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container">
        <EmptyState
          icon={PackageX}
          tone="error"
          title="We could not find that order"
          description={error || 'Check that the link is correct or head back to your order history.'}
        >
          <Button to={isAdmin ? '/admin/orders' : '/orders'} variant="outline">
            {isAdmin ? 'Back to admin orders' : 'Back to my orders'}
          </Button>
        </EmptyState>
      </div>
    );
  }

  const items = order.order_items.map((item) => ({
    id: item.id,
    name: item.product_name,
    image_url: item.image_url,
    size: item.size,
    quantity: item.quantity,
    price: item.unit_price,
  }));
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const delivery = Math.max(order.total_amount - subtotal, 0);
  const currentStep = TRACKING_STEPS.findIndex((step) => step.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className={`container ${styles.page}`}>
      <Link to={isAdmin ? '/admin/orders' : '/orders'} className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        {isAdmin ? 'All orders' : 'My orders'}
      </Link>

      {justPlaced ? (
        <div className={styles.banner} role="status">
          <span className={styles.bannerIcon}>
            <CheckCircle2 size={22} aria-hidden="true" />
          </span>
          <div>
            <p className={styles.bannerTitle}>Order placed successfully</p>
            <p className={styles.bannerCopy}>
              We have your order. You will pay {formatPrice(order.total_amount)} in cash when it arrives.
            </p>
          </div>
        </div>
      ) : null}

      <header className={styles.header}>
        <div>
          <p className="eyebrow">Order</p>
          <h1 className={styles.title}>{formatOrderNumber(order.id)}</h1>
          <p className={styles.date}>Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <Badge variant={ORDER_STATUS_VARIANT[order.status] || 'neutral'}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </Badge>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Tracking</h2>
            {isCancelled ? (
              <div className={styles.cancelled}>
                <p className={styles.cancelledTitle}>This order was cancelled</p>
                <p className={styles.cancelledCopy}>
                  No payment was taken. Place a new order if you still want these sneakers.
                </p>
              </div>
            ) : (
              <ol className={styles.timeline}>
                {TRACKING_STEPS.map((step, index) => {
                  const complete = index <= currentStep;
                  return (
                    <li key={step.status} className={`${styles.step} ${complete ? styles.stepComplete : ''}`}>
                      <span className={styles.stepDot}>
                        {complete ? <Check size={14} aria-hidden="true" /> : <Truck size={14} aria-hidden="true" />}
                      </span>
                      <div>
                        <p className={styles.stepLabel}>{step.label}</p>
                        <p className={styles.stepCopy}>{step.copy}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              Items <span className={styles.count}>({items.length})</span>
            </h2>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <ProductImage src={item.image_url} name={item.name} className={styles.image} />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <div className={styles.itemPrice}>
                    <p>{formatPrice(item.price * item.quantity)}</p>
                    {item.quantity > 1 ? (
                      <p className={styles.unit}>{formatPrice(item.price)} each</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={styles.side}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Delivery</h2>
            <p className={styles.deliverName}>{order.delivery_name}</p>
            <p className={styles.deliverLine}>{order.delivery_phone}</p>
            <p className={styles.deliverLine}>{order.delivery_address}</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Payment</h2>
            <div className={styles.paymentRow}>
              <span>Method</span>
              <Badge variant="neutral">Cash on Delivery</Badge>
            </div>
            <dl className={styles.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{delivery === 0 ? 'Free' : formatPrice(delivery)}</dd>
              </div>
              <div className={styles.grandTotal}>
                <dt>Total</dt>
                <dd>{formatPrice(order.total_amount)}</dd>
              </div>
            </dl>
            <p className={styles.fixedNote}>Prices are fixed at the time the order was placed.</p>
          </section>

          <Button to="/products" variant="outline" fullWidth>
            Continue shopping
          </Button>
        </aside>
      </div>
    </div>
  );
}
