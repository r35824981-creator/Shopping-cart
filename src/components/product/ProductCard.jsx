import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ShoeArtwork from './ShoeArtwork';
import { formatPrice } from '../../utils/format';
import styles from './ProductCard.module.css';

/**
 * Product tile used in grids across the storefront.
 * @param {{ product: object, compact?: boolean }} props
 */
export default function ProductCard({ product, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const totalStock = (product.sizes || []).reduce((total, size) => total + size.stock, 0);
  const showArtwork = !product.image_url || imageFailed;

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <Link to={`/products/${product.slug}`} className={styles.link} aria-label={`View ${product.name}`}>
        <div className={styles.media}>
          {showArtwork ? (
            <ShoeArtwork name={product.name} />
          ) : (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
          {product.is_featured ? <span className={styles.tag}>Featured</span> : null}
          {totalStock === 0 ? <span className={styles.soldOut}>Sold out</span> : null}
          <span className={styles.open} aria-hidden="true">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <div className={styles.body}>
          <p className={styles.meta}>
            {product.brand} · {product.category}
          </p>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
