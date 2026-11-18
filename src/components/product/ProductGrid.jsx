import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import styles from './ProductGrid.module.css';

/**
 * Responsive product grid with loading, error and empty states.
 * @param {object} props
 */
export default function ProductGrid({
  products = [],
  loading = false,
  error = '',
  emptyTitle = 'No sneakers found',
  emptyDescription = 'Try a different search or clear a filter.',
  children,
}) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`skeleton-${index}`} className={styles.skeleton}>
            <Skeleton height="0" className={styles.skeletonMedia} />
            <Skeleton width="40%" height="10px" />
            <Skeleton width="80%" height="14px" />
            <Skeleton width="30%" height="14px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={PackageSearch} tone="error" title="Could not load products" description={error} />;
  }

  if (products.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {children}
    </div>
  );
}
