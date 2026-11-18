import { SlidersHorizontal } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import styles from './FilterPanel.module.css';

/**
 * Category, brand and price filters for the listing page.
 * @param {object} props
 */
export default function FilterPanel({ options, filters, onChange, onClear, showHeading = true, bare = false }) {
  const hasFilters =
    Boolean(filters.category) ||
    filters.brands.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '';

  const toggleBrand = (brand) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((entry) => entry !== brand)
      : [...filters.brands, brand];
    onChange({ brands: next });
  };

  return (
    <div className={`${styles.panel} ${bare ? styles.bare : ''}`}>
      {showHeading ? (
        <div className={styles.heading}>
          <span className={styles.title}>
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
          </span>
          {hasFilters ? (
            <button type="button" className={styles.clear} onClick={onClear}>
              Clear all
            </button>
          ) : null}
        </div>
      ) : hasFilters ? (
        <div className={styles.heading}>
          <span />
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear all
          </button>
        </div>
      ) : null}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Category</legend>
        <button
          type="button"
          className={`${styles.option} ${!filters.category ? styles.active : ''}`}
          onClick={() => onChange({ category: '' })}
        >
          All categories
        </button>
        {options.categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`${styles.option} ${filters.category === category ? styles.active : ''}`}
            onClick={() => onChange({ category })}
          >
            {category}
          </button>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Brand</legend>
        {options.brands.map((brand) => (
          <label key={brand} className={styles.check}>
            <input
              type="checkbox"
              checked={filters.brands.includes(brand)}
              onChange={() => toggleBrand(brand)}
            />
            <span>{brand}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Price range</legend>
        <div className={styles.priceGrid}>
          <label className={styles.priceField}>
            <span>Min</span>
            <input
              type="number"
              min="0"
              step="500"
              inputMode="numeric"
              placeholder={options.priceRange.min ? String(options.priceRange.min) : '0'}
              value={filters.minPrice}
              onChange={(event) => onChange({ minPrice: event.target.value })}
            />
          </label>
          <label className={styles.priceField}>
            <span>Max</span>
            <input
              type="number"
              min="0"
              step="500"
              inputMode="numeric"
              placeholder={options.priceRange.max ? String(options.priceRange.max) : 'Any'}
              value={filters.maxPrice}
              onChange={(event) => onChange({ maxPrice: event.target.value })}
            />
          </label>
        </div>
        {options.priceRange.min ? (
          <p className={styles.rangeHint}>
            Available from {formatPrice(options.priceRange.min)} to {formatPrice(options.priceRange.max)}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
