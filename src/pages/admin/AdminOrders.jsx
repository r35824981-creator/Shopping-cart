import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ExternalLink } from 'lucide-react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { fetchAllOrders, updateOrderStatus } from '../../services/orderService';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../lib/constants';
import { formatDate, formatOrderNumber, formatPrice } from '../../utils/format';
import styles from './admin.module.css';

const STATUS_CLASS = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  shipped: styles.statusShipped,
  delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled,
};

/** Admin order list with inline status updates. */
export default function AdminOrders() {
  useDocumentTitle('Admin orders');
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchAllOrders()
      .then((items) => {
        if (active) setOrders(items);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load orders.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const next = { all: orders.length };
    ORDER_STATUSES.forEach((status) => {
      next[status] = orders.filter((order) => order.status === status).length;
    });
    return next;
  }, [orders]);

  const visibleOrders = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter],
  );

  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, status);
      setOrders((current) =>
        current.map((entry) => (entry.id === order.id ? { ...entry, status } : entry)),
      );
      toast.success(`${formatOrderNumber(order.id)} marked ${ORDER_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (updateError) {
      toast.error(updateError.message || 'Could not update the order status.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading orders...' : `${orders.length} order${orders.length === 1 ? '' : 's'} placed so far.`}
          </p>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Filter orders by status">
        <button
          type="button"
          className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`${styles.tab} ${filter === status ? styles.tabActive : ''}`}
            onClick={() => setFilter(status)}
          >
            {ORDER_STATUS_LABELS[status]} ({counts[status]})
          </button>
        ))}
      </div>

      {error ? (
        <EmptyState icon={ClipboardList} tone="error" title="Could not load orders" description={error} />
      ) : (
        <section className={styles.card}>
          <div className={styles.tableWrap}>
            {loading ? (
              <p className={styles.emptyText}>Loading orders...</p>
            ) : visibleOrders.length === 0 ? (
              <p className={styles.emptyText}>
                {orders.length === 0 ? 'No orders have been placed yet.' : 'No orders with this status.'}
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Placed</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th aria-label="Open order" />
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => {
                    const items = order.order_items.reduce((total, item) => total + item.quantity, 0);
                    return (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/orders/${order.id}`} className={styles.link}>
                            {formatOrderNumber(order.id)}
                          </Link>
                          <p className={styles.productMeta}>COD</p>
                        </td>
                        <td>
                          <p className={styles.productName}>{order.customer}</p>
                          <p className={styles.productMeta}>{order.delivery_phone}</p>
                        </td>
                        <td className={styles.muted}>{formatDate(order.created_at)}</td>
                        <td className={styles.muted}>{items}</td>
                        <td className={styles.price}>{formatPrice(order.total_amount)}</td>
                        <td>
                          <select
                            className={`${styles.statusSelect} ${STATUS_CLASS[order.status] || ''}`}
                            value={order.status}
                            onChange={(event) => changeStatus(order, event.target.value)}
                            disabled={busyId === order.id}
                            aria-label={`Status for order ${formatOrderNumber(order.id)}`}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {ORDER_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <Link
                            to={`/orders/${order.id}`}
                            className={styles.iconButton}
                            aria-label={`Open order ${formatOrderNumber(order.id)}`}
                          >
                            <ExternalLink size={16} aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      <Button to="/admin/products" variant="outline">
        Manage products
      </Button>
    </div>
  );
}
