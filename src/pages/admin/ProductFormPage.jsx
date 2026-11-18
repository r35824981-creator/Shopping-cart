import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PackageX } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { createProduct, fetchProductById, updateProduct } from '../../services/productService';
import { slugify } from '../../utils/slugify';
import styles from './admin.module.css';

/** Create or edit a product. */
export default function ProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useDocumentTitle(editing ? 'Edit product' : 'Add product');

  useEffect(() => {
    if (!editing) {
      setProduct(null);
      setLoading(false);
      setLoadError('');
      return undefined;
    }
    let active = true;
    setLoading(true);
    setLoadError('');

    fetchProductById(id)
      .then((item) => {
        if (active) setProduct(item);
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'Could not load this product.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, editing]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      if (editing) {
        await updateProduct(id, payload);
        toast.success('Product updated.');
      } else {
        await createProduct({ ...payload, slug: slugify(payload.name) });
        toast.success('Product created.');
      }
      navigate('/admin/products');
    } catch (error) {
      setSubmitError(error.message || 'Could not save the product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div>
        <Link to="/admin/products" className={styles.back}>
          <ArrowLeft size={14} aria-hidden="true" />
          Back to products
        </Link>
        <div className={styles.formHeader}>
          <div className={styles.heading}>
            <h1 className={styles.title}>{editing ? 'Edit product' : 'Add a product'}</h1>
            <p className={styles.subtitle}>
              {editing
                ? 'Update the details, sizes and availability. Changes go live immediately.'
                : 'Fill in the details and set stock for each size.'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeleton}>
          <Skeleton width="40%" height="20px" />
          <Skeleton width="100%" height="220px" />
        </div>
      ) : loadError ? (
        <EmptyState icon={PackageX} tone="error" title="Could not load this product" description={loadError}>
          <Button to="/admin/products" variant="outline">
            Back to products
          </Button>
        </EmptyState>
      ) : (
        <ProductForm
          initialProduct={product}
          submitting={submitting}
          error={submitError}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
