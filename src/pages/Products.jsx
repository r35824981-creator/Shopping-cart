import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import FilterPanel from '../components/product/FilterPanel';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import Select from '../components/ui/Select';
import { useProducts } from '../hooks/useProducts';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SORT_OPTIONS } from '../lib/constants';
import styles from './Products.module.css';

/** Product listing with search, filters and sorting. */
export default function Products() {
  useDocumentTitle('Shop sneakers');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brands = searchParams.getAll('brand');
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';
  const sort = searchParams.get('sort') || 'featured';

  const [searchDraft, setSearchDraft] = useState(search);
  useEffect(() => setSearchDraft(search), [search]);

  const { options } = useFilterOptions();

  const query = useMemo(
    () => ({
      search,
      category,
      brands,
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) || 0,
      sort,
    }),
    [search, category, brands, minPrice, maxPrice, sort],
  );

  const { products, loading, error } = useProducts(query);

  const replaceParams = (next) => setSearchParams(next, { replace: true });

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key, value) => {
      if (value) next.set(key, value);
      else next.delete(key);
    };

    if ('category' in patch) setOrDelete('category', patch.category);
    if ('brands' in patch) {
      next.delete('brand');
      patch.brands.forEach((brand) => next.append('brand', brand));
    }
    if ('minPrice' in patch) setOrDelete('min', patch.minPrice);
    if ('maxPrice' in patch) setOrDelete('max', patch.maxPrice);
    if ('sort' in patch) setOrDelete('sort', patch.sort === 'featured' ? '' : patch.sort);

    replaceParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    if (sort !== 'featured') next.set('sort', sort);
    replaceParams(next);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchDraft.trim()) next.set('search', searchDraft.trim());
    else next.delete('search');
    replaceParams(next);
  };

  const removeSearch = () => {
    setSearchDraft('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    replaceParams(next);
  };

  const activeFilterCount =
    (category ? 1 : 0) + brands.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const filterProps = {
    options,
    filters: { category, brands, minPrice, maxPrice },
    onChange: updateFilters,
    onClear: clearFilters,
  };

  return (
    <div className="container">
      <header className="pageHeader">
        <div className={styles.heading}>
          <p className="eyebrow">Shop</p>
          <h1 className={styles.title}>All sneakers</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading the collection...' : `${products.length} pair${products.length === 1 ? '' : 's'} ready to go`}
          </p>
        </div>

        <div className={styles.toolbar}>
          <form className={styles.search} onSubmit={submitSearch} role="search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search sneakers"
              aria-label="Search sneakers"
            />
            <button type="submit" className={styles.searchButton}>
              Go
            </button>
          </form>

          <div className={styles.sort}>
            <Select
              aria-label="Sort products"
              value={sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={SlidersHorizontal}
            className={styles.filterButton}
            onClick={() => setFiltersOpen(true)}
          >
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Button>
        </div>
      </header>

      {search ? (
        <div className={styles.searchNotice}>
          <p>
            Results for <strong>“{search}”</strong>
          </p>
          <button type="button" onClick={removeSearch}>
            Clear search
          </button>
        </div>
      ) : null}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FilterPanel {...filterProps} />
        </aside>

        <section className={styles.results} aria-live="polite">
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            emptyTitle="No sneakers match those filters"
            emptyDescription="Try widening the price range or removing a brand."
          />
        </section>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        width="sm"
        footer={
          <Button fullWidth onClick={() => setFiltersOpen(false)}>
            Show {loading ? 'results' : `${products.length} result${products.length === 1 ? '' : 's'}`}
          </Button>
        }
      >
        <FilterPanel {...filterProps} showHeading={false} bare />
      </Drawer>
    </div>
  );
}
