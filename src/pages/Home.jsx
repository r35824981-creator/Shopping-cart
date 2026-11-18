import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, RotateCcw, Sparkles, Truck } from 'lucide-react';
import Button from '../components/ui/Button';
import ProductGrid from '../components/product/ProductGrid';
import ProductImage from '../components/product/ProductImage';
import { useFeaturedProducts } from '../hooks/useProductDetail';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatPrice } from '../utils/format';
import styles from './Home.module.css';

const COLLECTIONS = [
  { category: 'Running', title: 'Run further', copy: 'Cushioned daily trainers and race-day speed.' },
  { category: 'Lifestyle', title: 'Everyday classics', copy: 'Court icons and terrace staples for any fit.' },
  { category: 'Basketball', title: 'Court ready', copy: 'Grip, support and bounce for the hardwood.' },
];

const VALUES = [
  { icon: Truck, title: 'Free delivery', copy: 'On every order above ₹4,999.' },
  { icon: BadgeCheck, title: 'Cash on Delivery', copy: 'Pay only when your pair arrives.' },
  { icon: RotateCcw, title: 'Easy size swaps', copy: 'Seven days to find the right fit.' },
];

/** Storefront landing page. */
export default function Home() {
  useDocumentTitle('Sneakers, simplified');
  const { products, loading, error } = useFeaturedProducts(4);
  const hero = products[0];

  return (
    <>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            New season drop
          </p>
          <h1 className={styles.headline}>
            Step into your <span className={styles.accent}>next pair.</span>
          </h1>
          <p className={styles.lead}>
            A tight edit of sneakers for the street, the track and everything in between. Pick your size,
            we handle the rest.
          </p>
          <div className={styles.heroActions}>
            <Button to="/products" size="lg" icon={ArrowRight} iconAfter>
              Shop collection
            </Button>
            <Button to="/products?sort=newest" variant="outline" size="lg">
              New arrivals
            </Button>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>Brands</dt>
              <dd>6</dd>
            </div>
            <div>
              <dt>Dispatch</dt>
              <dd>48h</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>COD</dd>
            </div>
          </dl>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroShape} aria-hidden="true" />
          <div className={styles.heroImage}>
            <ProductImage
              src={hero?.image_url}
              name={hero?.name || 'FootWear sneaker'}
              className={styles.heroPhoto}
            />
          </div>
          <div className={styles.heroTag}>
            <p className={styles.tagLabel}>Featured</p>
            <p className={styles.tagName}>{hero?.name || 'The season edit'}</p>
            <p className={styles.tagPrice}>{hero ? formatPrice(hero.price) : 'Explore the range'}</p>
          </div>
          <div className={styles.heroChip}>
            <Truck size={16} aria-hidden="true" />
            Free delivery over ₹4,999
          </div>
        </div>
      </section>

      <div className={`container ${styles.brands}`} aria-label="Brands we stock">
        {['Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok', 'Asics'].map((brand) => (
          <span key={brand}>{brand}</span>
        ))}
      </div>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">Fresh in</p>
            <h2 className="sectionTitle">Featured this week</h2>
          </div>
          <Link to="/products" className={styles.viewAll}>
            View all <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          emptyTitle="The drop is loading"
          emptyDescription="Check back in a moment for this week's picks."
        />
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">Collections</p>
            <h2 className="sectionTitle">Find your lane</h2>
          </div>
        </div>
        <div className={styles.collections}>
          {COLLECTIONS.map((collection) => {
            const match = products.find((product) => product.category === collection.category);
            return (
              <Link
                key={collection.category}
                to={`/products?category=${encodeURIComponent(collection.category)}`}
                className={styles.collection}
              >
                <div className={styles.collectionMedia}>
                  <ProductImage
                    src={match?.image_url}
                    name={collection.title}
                    className={styles.collectionImage}
                  />
                </div>
                <div className={styles.collectionBody}>
                  <div>
                    <h3 className={styles.collectionTitle}>{collection.title}</h3>
                    <p className={styles.collectionCopy}>{collection.copy}</p>
                  </div>
                  <span className={styles.collectionArrow}>
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.values}>
          {VALUES.map(({ icon: Icon, title, copy }) => (
            <div key={title} className={styles.value}>
              <span className={styles.valueIcon}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className={styles.valueTitle}>{title}</h3>
                <p className={styles.valueCopy}>{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`container ${styles.ctaSection}`}>
        <div className={styles.cta}>
          <div>
            <p className={styles.ctaEyebrow}>Not sure where to start?</p>
            <h2 className={styles.ctaTitle}>Browse every pair in one place.</h2>
          </div>
          <Button to="/products" variant="primary" size="lg" icon={ArrowRight} iconAfter>
            Shop all sneakers
          </Button>
        </div>
      </section>
    </>
  );
}
