import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Loader2, Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import ProductImage from '../product/ProductImage';
import { uploadProductImage } from '../../services/storageService';
import { ALL_SIZES, BRANDS, CATEGORIES } from '../../lib/seedData';
import { slugify } from '../../utils/slugify';
import { useToast } from '../../context/ToastContext';
import styles from './ProductForm.module.css';

const blankSizes = () => ALL_SIZES.map((size) => ({ size, stock: '' }));

/**
 * Shared create/edit form for products.
 * @param {{ initialProduct?: object|null, submitting?: boolean, error?: string, onSubmit: Function }} props
 */
export default function ProductForm({ initialProduct = null, submitting = false, error = '', onSubmit }) {
  const toast = useToast();
  const [values, setValues] = useState({
    name: initialProduct?.name || '',
    brand: initialProduct?.brand || BRANDS[0],
    category: initialProduct?.category || CATEGORIES[0],
    price: initialProduct ? String(initialProduct.price) : '',
    description: initialProduct?.description || '',
    imageUrl: initialProduct?.image_url || '',
    isFeatured: Boolean(initialProduct?.is_featured),
    isActive: initialProduct ? initialProduct.is_active !== false : true,
  });
  const [sizes, setSizes] = useState(() => {
    if (!initialProduct?.sizes?.length) return blankSizes();
    return ALL_SIZES.map((size) => {
      const match = initialProduct.sizes.find((entry) => entry.size === size);
      return { size, stock: match ? String(match.stock) : '0' };
    });
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const updateStock = (size, stock) => {
    setSizes((current) => current.map((entry) => (entry.size === size ? { ...entry, stock } : entry)));
    setErrors((current) => ({ ...current, sizes: '' }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setValues((current) => ({ ...current, imageUrl: url }));
      toast.success('Image uploaded.');
    } catch (uploadError) {
      toast.error(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 3) next.name = 'Enter a product name of at least 3 characters.';
    if (!values.brand) next.brand = 'Choose a brand.';
    if (!values.category) next.category = 'Choose a category.';
    const price = Number(values.price);
    if (!values.price || Number.isNaN(price) || price <= 0) next.price = 'Enter a price greater than zero.';
    if (values.description.trim().length < 20) next.description = 'Write at least 20 characters of description.';

    const hasStock = sizes.some((entry) => Number(entry.stock) > 0);
    if (!hasStock) next.sizes = 'Add stock for at least one size.';
    if (sizes.some((entry) => Number(entry.stock) < 0 || Number.isNaN(Number(entry.stock)))) {
      next.sizes = 'Stock must be zero or a positive number.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: values.name,
      brand: values.brand,
      category: values.category,
      price: Number(values.price),
      description: values.description,
      imageUrl: values.imageUrl,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      sizes: sizes.map((entry) => ({ size: entry.size, stock: Number(entry.stock) || 0 })),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Product details</h2>
            <div className={styles.fields}>
              <Input
                label="Product name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g. Air Zoom Pegasus 41"
              />
              <p className={styles.slug}>
                Storefront link: <code>/products/{slugify(values.name) || 'product-slug'}</code>
              </p>
              <div className={styles.row}>
                <Select label="Brand" name="brand" value={values.brand} onChange={handleChange} error={errors.brand}>
                  {BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  error={errors.category}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                label="Price (₹)"
                name="price"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={values.price}
                onChange={handleChange}
                error={errors.price}
                placeholder="e.g. 12499"
              />
              <Textarea
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={errors.description}
                rows={4}
                placeholder="What makes this pair special?"
              />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Sizes and stock</h2>
              <span className={styles.cardHint}>Set 0 for sizes that are unavailable</span>
            </div>
            {errors.sizes ? (
              <p className={styles.fieldError} role="alert">
                {errors.sizes}
              </p>
            ) : null}
            <div className={styles.sizeGrid}>
              {sizes.map((entry) => (
                <label key={entry.size} className={styles.sizeField}>
                  <span>{entry.size}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={entry.stock}
                    onChange={(event) => updateStock(entry.size, event.target.value)}
                    aria-label={`Stock for ${entry.size}`}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.side}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Image</h2>
            <div className={styles.preview}>
              {values.imageUrl ? (
                <ProductImage src={values.imageUrl} name={values.name || 'Product'} className={styles.previewImage} />
              ) : (
                <div className={styles.previewEmpty}>
                  <ImagePlus size={24} aria-hidden="true" />
                  <span>No image yet</span>
                </div>
              )}
              {uploading ? (
                <div className={styles.uploading}>
                  <Loader2 size={20} className={styles.spin} aria-hidden="true" />
                  Uploading
                </div>
              ) : null}
            </div>

            <label className={styles.uploadButton}>
              <ImagePlus size={16} aria-hidden="true" />
              {values.imageUrl ? 'Replace image' : 'Upload image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} hidden />
            </label>

            <Input
              label="Or paste an image URL"
              name="imageUrl"
              value={values.imageUrl.startsWith('data:') ? '' : values.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              hint="JPG, PNG or WebP up to 5 MB."
            />
            {values.imageUrl ? (
              <button
                type="button"
                className={styles.clearImage}
                onClick={() => setValues((current) => ({ ...current, imageUrl: '' }))}
              >
                <X size={14} aria-hidden="true" />
                Remove image
              </button>
            ) : null}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Visibility</h2>
            <label className={styles.toggle}>
              <input type="checkbox" name="isActive" checked={values.isActive} onChange={handleChange} />
              <span className={styles.track} aria-hidden="true">
                <span className={styles.knob} />
              </span>
              <span>
                <strong>Active</strong>
                <small>Show this product in the store</small>
              </span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" name="isFeatured" checked={values.isFeatured} onChange={handleChange} />
              <span className={styles.track} aria-hidden="true">
                <span className={styles.knob} />
              </span>
              <span>
                <strong>Featured</strong>
                <small>Include it in the home page picks</small>
              </span>
            </label>
          </section>

          <div className={styles.actions}>
            <Button type="submit" size="lg" fullWidth loading={submitting} icon={Save}>
              {initialProduct ? 'Save changes' : 'Create product'}
            </Button>
            <Button to="/admin/products" variant="outline" fullWidth disabled={submitting}>
              Cancel
            </Button>
            <p className={styles.hint}>
              Need the live store? <Link to="/products">Open the storefront</Link>
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
