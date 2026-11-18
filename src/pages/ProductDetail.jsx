import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, ChevronRight, PackageX, RotateCcw, ShoppingBag, Truck } from 'lucide-react';
import ProductGallery from '../components/product/ProductGallery';
import SizeSelector from '../components/product/SizeSelector';
import QuantityStepper from '../components/product/QuantityStepper';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { useProductDetail } from '../hooks/useProductDetail';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import styles from './ProductDetail.module.css';

/** Product detail page with size selection and add to cart. */
export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { product, related, loading, error } = useProductDetail(slug);

  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState('');
  const [adding, setAdding] = useState(false);

  useDocumentTitle(product ? product.name : 'Product');

  useEffect(() => {
    setSize('');
    setQuantity(1);
    setSizeError('');
  }, [slug]);

  if (loading) {
    return (
      <div className={`container ${styles.loading}`} aria-busy="true">
        <Skeleton width="35%" height="12px" />
        <div className={styles.loadingGrid}>
          <Skeleton height="0" className={styles.loadingImage} />
          <div className={styles.loadingCopy}>
            <Skeleton width="60%" height="32px" />
            <Skeleton width="25%" height="20px" />
            <Skeleton width="100%" height="12px" />
            <Skeleton width="90%" height="12px" />
            <Skeleton width="70%" height="12px" />
            <Skeleton width="100%" height="48px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <EmptyState
          icon={PackageX}
          tone="error"
          title="We could not find that sneaker"
          description={error || 'It may have sold out or been removed from the store.'}
        >
          <Button to="/products" variant="outline">
            Back to all sneakers
          </Button>
        </EmptyState>
      </div>
    );
  }

  const totalStock = product.sizes.reduce((total, entry) => total + entry.stock, 0);
  const selectedStock = product.sizes.find((entry) => entry.size === size)?.stock || 0;

  const handleAddToCart = async () => {
    if (!size) {
      setSizeError('Choose a size before adding to cart.');
      return;
    }
    if (!user) {
      toast.error('Sign in to add items to your cart.');
      navigate('/login', { state: { from: `/products/${product.slug}` } });
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, size, quantity);
      toast.success(`${product.name} (${size}) added to your cart.`);
    } catch (addError) {
      toast.error(addError.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to="/products">Collections</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className={styles.grid}>
          <ProductGallery product={product} />

          <div className={styles.details}>
            <div className={styles.heading}>
              <p className={styles.meta}>
                {product.brand} · {product.category}
              </p>
              <h1 className={styles.name}>{product.name}</h1>
              <div className={styles.priceRow}>
                <p className={styles.price}>{formatPrice(product.price)}</p>
                {totalStock > 0 ? (
                  <Badge variant="success">In stock</Badge>
                ) : (
                  <Badge variant="error">Sold out</Badge>
                )}
              </div>
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.divider} />

            <div className={styles.buy}>
              <SizeSelector
                sizes={product.sizes}
                value={size}
                onChange={(nextSize) => {
                  setSize(nextSize);
                  setSizeError('');
                  setQuantity(1);
                }}
                error={sizeError}
              />
              <p className={styles.stockNote}>
                {size
                  ? selectedStock > 0
                    ? `${selectedStock} pair${selectedStock === 1 ? '' : 's'} left in ${size}`
                    : 'That size is out of stock.'
                  : 'Pick a size to see availability.'}
              </p>

              <div className={styles.quantityRow}>
                <span className={styles.quantityLabel}>Quantity</span>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  max={Math.max(selectedStock || 1, 1)}
                  disabled={!size || selectedStock === 0}
                />
              </div>

              <Button
                size="lg"
                fullWidth
                icon={ShoppingBag}
                loading={adding}
                onClick={handleAddToCart}
                disabled={totalStock === 0}
              >
                {totalStock === 0 ? 'Sold out' : 'Add to cart'}
              </Button>
              {!user ? (
                <p className={styles.signInHint}>
                  <Link to="/login">Sign in</Link> to add items and check out.
                </p>
              ) : null}
            </div>

            <ul className={styles.perks}>
              <li>
                <Truck size={18} aria-hidden="true" />
                <span>Free delivery over ₹4,999. Dispatched within 48 hours.</span>
              </li>
              <li>
                <BadgeCheck size={18} aria-hidden="true" />
                <span>Cash on Delivery on every order.</span>
              </li>
              <li>
                <RotateCcw size={18} aria-hidden="true" />
                <span>Seven days to exchange for another size.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className={`container ${styles.related}`}>
          <div className={styles.relatedHead}>
            <h2 className="sectionTitle">You may also like</h2>
            <Link to="/products" className={styles.relatedLink}>
              Browse all
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </>
  );
}
