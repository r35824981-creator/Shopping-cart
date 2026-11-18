import { useEffect, useState } from 'react';
import { fetchFilterOptions } from '../services/productService';

/**
 * Load filter options (categories, brands, price range).
 * @returns {{ options: { categories: string[], brands: string[], priceRange: { min: number, max: number } } }}
 */
export function useFilterOptions() {
  const [options, setOptions] = useState({ categories: [], brands: [], priceRange: { min: 0, max: 0 } });

  useEffect(() => {
    let active = true;
    fetchFilterOptions()
      .then((next) => {
        if (active) setOptions(next);
      })
      .catch(() => {
        if (active) setOptions({ categories: [], brands: [], priceRange: { min: 0, max: 0 } });
      });

    return () => {
      active = false;
    };
  }, []);

  return { options };
}
