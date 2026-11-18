import { useState } from 'react';
import ShoeArtwork from './ShoeArtwork';
import styles from './ProductImage.module.css';

/**
 * Product photo with a generated fallback when the image is missing or fails.
 * @param {{ src?: string, name: string, className?: string, alt?: string }} props
 */
export default function ProductImage({ src, name, className = '', alt, ...rest }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={`${styles.fallback} ${className}`}>
        <ShoeArtwork name={name} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? name}
      loading="lazy"
      className={`${styles.image} ${className}`}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
