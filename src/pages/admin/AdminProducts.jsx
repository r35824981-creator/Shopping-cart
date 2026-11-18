import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, PackageX, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ProductImage from '../../components/product/ProductImage';
import Skeleton from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { deleteProduct, fetchAllProducts } from '../../services/productService';
import { formatPrice } from '../../utils/format';
import styles from './admin.module.css';

/** Admin product list with edit and delete actions. */
export default function AdminProducts() {
  useDocumentTitle('Admin products');
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchAllProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(term),
    );
  }, [products, search]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.id);
      toast.success(`${pendingDelete.name} deleted.`);
      setPendingDelete(null);
      setReloadToken((token) => token + 1);
    } catch (deleteError) {
      toast.error(deleteError.message || 'Could not delete the product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading products...' : `${products.length} product${products.length === 1 ? '' : 's'} in the catalogue.`}
          </p>
        </div>
        <div className={styles.actions}>
          <Button to="/admin/products/new" icon={Plus}>
            Add product
          </Button>
        </div>
      </header>

      {error ? (
        <EmptyState icon={PackageX} tone="error" title="Could not load products" description={error}>
          <Button variant="outline" onClick={() => setReloadToken((token) => token + 1)}>
            Try again
          </Button>
        </EmptyState>
      ) : (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.search}>
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
              />
            </div>
          </div>
          <div className={styles.tableWrap}>
            {loading ? (
              <div className={styles.skeletonRows}>
                {[1, 2, 3, 4].map((key) => (
                  <div key={key} className={styles.skeleton}>
                    <Skeleton width="100%" height="14px" />
                    <Skeleton width="70%" height="12px" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className={styles.emptyText}>
                {products.length === 0 ? 'No products yet. Add your first pair.' : 'No products match that search.'}
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const stock = product.sizes.reduce((total, size) => total + size.stock, 0);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className={styles.productCell}>
                            <ProductImage
                              src={product.image_url}
                              name={product.name}
                              className={styles.thumb}
                            />
                            <div>
                              <p className={styles.productName}>{product.name}</p>
                              <p className={styles.productMeta}>{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className={styles.muted}>{product.category}</td>
                        <td className={styles.price}>{formatPrice(product.price)}</td>
                        <td>
                          {stock > 0 ? (
                            <span className={styles.strong}>{stock} pairs</span>
                          ) : (
                            <Badge variant="error">Sold out</Badge>
                          )}
                        </td>
                        <td>
                          {product.is_active ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="neutral">Hidden</Badge>
                          )}
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            {product.is_active ? (
                              <Link
                                to={`/products/${product.slug}`}
                                className={styles.iconButton}
                                aria-label={`View ${product.name} in the store`}
                              >
                                <ExternalLink size={16} aria-hidden="true" />
                              </Link>
                            ) : null}
                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className={styles.iconButton}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              className={`${styles.iconButton} ${styles.danger}`}
                              onClick={() => setPendingDelete(product)}
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
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

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => !deleting && setPendingDelete(null)}
        title="Delete product?"
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              Delete product
            </Button>
          </>
        }
      >
        <p className={styles.muted}>
          <strong className={styles.strong}>{pendingDelete?.name}</strong> will be removed from the store and from
          any carts. Past orders keep their saved details.
        </p>
      </Modal>
    </div>
  );
}
