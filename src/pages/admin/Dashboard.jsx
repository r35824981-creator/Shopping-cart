import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Clock, IndianRupee, Package, Plus, ShoppingBag } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchAllOrders } from '../../services/orderService';
import { fetchAllProducts } from '../../services/productService';
import { isDemoMode } from '../../lib/dataClient';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT } from '../../lib/constants';
import { formatDate, formatOrderNumber, formatPrice } from '../../utils/format';
import styles from './admin.module.css';

/** Admin overview with store metrics, recent orders and low stock. */
export default function Dashboard() {
  useDocumentTitle('Admin dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([fetchAllOrders(), fetchAllProducts()])
      .then(([nextOrders, nextProducts]) => {
        if (!active) return;
        setOrders(nextOrders);
        setProducts(nextProducts);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load dashboard data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const liveOrders = orders.filter((order) => order.status !== 'cancelled');
  const revenue = liveOrders.reduce((total, order) => total + Number(order.total_amount), 0);
  const pending = orders.filter((order) => order.status === 'pending').length;
  const activeProducts = products.filter((product) => product.is_active).length;

  const lowStock = products
    .filter((product) => product.is_active)
    .flatMap((product) =>
      product.sizes
        .filter((size) => size.stock <= 2)
        .map((size) => ({ id: `${product.id}-${size.size}`, name: product.name, size: size.size, stock: size.stock })),
    )
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>A quick read on how the store is doing.</p>
        </div>
        <div className={styles.actions}>
          <Button to="/admin/products/new" icon={Plus}>
            Add product
          </Button>
        </div>
      </header>

      {isDemoMode ? (
        <p className={styles.notice}>
          <AlertTriangle size={16} aria-hidden="true" />
          <span>
            <strong>Demo mode.</strong> No Supabase project is configured, so products, orders and accounts are
            stored in this browser. Add your Supabase keys to <code>.env</code> to use the live backend.
          </span>
        </p>
      ) : null}

      {loading ? (
        <div className={styles.stats}>
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className={styles.skeleton}>
              <Skeleton width="60%" height="10px" />
              <Skeleton width="40%" height="26px" />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.stats}>
          <StatCard
            label="Revenue"
            value={formatPrice(revenue)}
            hint="All orders except cancellations"
            icon={IndianRupee}
            tone="accent"
          />
          <StatCard label="Orders" value={String(orders.length)} hint="All time" icon={ShoppingBag} tone="neutral" />
          <StatCard
            label="Pending"
            value={String(pending)}
            hint="Waiting to be confirmed"
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label="Active products"
            value={String(activeProducts)}
            hint={`${products.length} products in total`}
            icon={Package}
            tone="success"
          />
        </div>
      )}

      {error ? (
        <EmptyState icon={AlertTriangle} tone="error" title="Could not load the dashboard" description={error} />
      ) : null}

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Recent orders</h2>
            <Link to="/admin/orders" className={styles.cardLink}>
              View all <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.tableWrap}>
            {loading ? (
              <div className={styles.emptyText}>Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <p className={styles.emptyText}>No orders yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/orders/${order.id}`} className={styles.link}>
                          {formatOrderNumber(order.id)}
                        </Link>
                      </td>
                      <td>{order.customer}</td>
                      <td className={styles.muted}>{formatDate(order.created_at)}</td>
                      <td className={styles.price}>{formatPrice(order.total_amount)}</td>
                      <td>
                        <Badge variant={ORDER_STATUS_VARIANT[order.status] || 'neutral'}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Low stock</h2>
            <Link to="/admin/products" className={styles.cardLink}>
              Manage <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.cardBody}>
            {loading ? (
              <p className={styles.muted}>Loading stock...</p>
            ) : lowStock.length === 0 ? (
              <p className={styles.emptyText}>Every size is comfortably stocked.</p>
            ) : (
              <div className={styles.lowStock}>
                {lowStock.map((entry) => (
                  <div key={entry.id} className={styles.lowStockItem}>
                    <div>
                      <p className={styles.lowStockName}>{entry.name}</p>
                      <p className={styles.lowStockMeta}>{entry.size}</p>
                    </div>
                    <span className={styles.lowStockCount}>
                      {entry.stock === 0 ? 'Sold out' : `${entry.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
