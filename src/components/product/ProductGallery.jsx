import { useState } from 'react';
import ShoeArtwork from './ShoeArtwork';
import styles from './ProductGallery.module.css';

const VIEWS = [
  { id: 'full', label: 'Full view', style: { objectPosition: 'center', transform: 'scale(1)' } },
  { id: 'toe', label: 'Toe detail', style: { objectPosition: '32% 58%', transform: 'scale(1.7)' } },
  { id: 'heel', label: 'Heel detail', style: { objectPosition: '76% 55%', transform: 'scale(1.7)' } },
];

/**
 * Product photo with zoomed detail thumbnails.
 * @param {{ product: object }} props
 */
export default function ProductGallery({ product }) {
  const [activeView, setActiveView] = useState(VIEWS[0]);
  const [imageFailed, setImageFailed] = useState(false);
  const showArtwork = !product.image_url || imageFailed;

  return (
    <div className={styles.gallery}>
      <div className={styles.thumbs}>
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            className={`${styles.thumb} ${activeView.id === view.id ? styles.thumbActive : ''}`}
            onClick={() => setActiveView(view)}
            aria-label={view.label}
            aria-pressed={activeView.id === view.id}
          >
            {showArtwork ? (
              <ShoeArtwork name={product.name} />
            ) : (
              <img
                src={product.image_url}
                alt=""
                style={{ objectPosition: view.style.objectPosition, transform: view.style.transform }}
                onError={() => setImageFailed(true)}
              />
            )}
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        {showArtwork ? (
          <ShoeArtwork name={product.name} className={styles.artwork} />
        ) : (
          <img
            key={activeView.id}
            src={product.image_url}
            alt={`${product.name} - ${activeView.label}`}
            className={styles.image}
            style={activeView.style}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
