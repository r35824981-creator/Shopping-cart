import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../services/productService';

/**
 * Load a filtered product list.
 * @param {object} query
 * @returns {{ products: Array<object>, loading: boolean, error: string, reload: Function }}
 */
export function useProducts(query) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const key = useMemo(() => JSON.stringify(query), [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchProducts(JSON.parse(key))
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((loadError) => {
        if (active) {
          setProducts([]);
          setError(loadError.message || 'Could not load products.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [key, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { products, loading, error, reload };
}
