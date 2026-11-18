import { useEffect, useState } from 'react';
import { fetchFeaturedProducts, fetchProductBySlug } from '../services/productService';

/**
 * Load the featured products for the home page.
 * @param {number} limit
 * @returns {{ products: Array<object>, loading: boolean, error: string }}
 */
export function useFeaturedProducts(limit = 4) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchFeaturedProducts(limit)
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load featured products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit]);

  return { products, loading, error };
}

/**
 * Load one product by slug and its related products.
 * @param {string} slug
 * @returns {{ product: object|null, related: Array<object>, loading: boolean, error: string }}
 */
export function useProductDetail(slug) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setProduct(null);

    fetchProductBySlug(slug)
      .then(async (item) => {
        if (!active) return;
        setProduct(item);
        const list = await fetchFeaturedProducts(8).catch(() => []);
        if (!active) return;
        setRelated(list.filter((entry) => entry.id !== item.id).slice(0, 4));
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load this product.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return { product, related, loading, error };
}
