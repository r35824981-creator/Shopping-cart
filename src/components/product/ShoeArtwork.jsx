import styles from './ShoeArtwork.module.css';

const PALETTES = [
  { body: '#e9e4da', overlay: '#d9d2c4', accent: '#ff5a1f' },
  { body: '#dde4ea', overlay: '#c9d4dd', accent: '#111111' },
  { body: '#f0e3d8', overlay: '#e2d0bf', accent: '#c2410c' },
  { body: '#e3e9dd', overlay: '#d1dac8', accent: '#166534' },
  { body: '#e9e2ee', overlay: '#d8cde0', accent: '#6d28d9' },
  { body: '#f1e4e4', overlay: '#e3d0d0', accent: '#be123c' },
];

/**
 * Stylised sneaker illustration used when a product photo is missing.
 * @param {{ name?: string, className?: string }} props
 */
export default function ShoeArtwork({ name = 'Sneaker', className = '' }) {
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];

  return (
    <svg
      className={`${styles.artwork} ${className}`}
      viewBox="0 0 400 240"
      role="img"
      aria-label={`${name} illustration`}
      style={{ '--shoe-body': palette.body, '--shoe-overlay': palette.overlay, '--shoe-accent': palette.accent }}
    >
      <ellipse cx="205" cy="203" rx="140" ry="14" fill="rgba(17,17,17,0.06)" />
      <path
        d="M55 168c2-34 18-68 50-88 22-14 45-16 63-6 16 9 24 24 35 42 12 20 28 35 54 43 22 7 38 13 48 21 8 6 12 14 12 23v12c0 8-7 14-15 14H74c-12 0-20-9-19-21l0-40Z"
        fill="var(--shoe-body)"
      />
      <path
        d="M57 170c4 14 15 23 31 23h240c14 0 24-8 26-19l2 12c1 9-6 16-15 16H75c-13 0-21-9-20-21l2-11Z"
        fill="var(--shoe-overlay)"
      />
      <path
        d="M56 186h265c16 0 29 7 32 18 2 8-4 14-13 14H70c-10 0-16-6-16-15l2-17Z"
        fill="#ffffff"
      />
      <path d="M60 205h288" stroke="#111111" strokeOpacity="0.14" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M150 145c26-8 53-4 72 12 9 8 19 15 32 20-64 6-116 4-146-6 10-14 25-22 42-26Z"
        fill="var(--shoe-overlay)"
        opacity="0.65"
      />
      <path
        d="M180 96c12-8 26-7 37 3l26 25c-19 8-40 13-62 14l-24-22c6-8 13-15 23-20Z"
        fill="var(--shoe-accent)"
      />
      <path
        d="M83 148c22-30 44-50 66-61"
        stroke="var(--shoe-accent)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.9"
      />
      <g stroke="#111111" strokeOpacity="0.35" strokeWidth="3.5" strokeLinecap="round">
        <path d="M120 124l28 22" />
        <path d="M134 112l28 22" />
        <path d="M149 102l27 21" />
      </g>
      <g fill="#111111" fillOpacity="0.35">
        <circle cx="126" cy="128" r="3.5" />
        <circle cx="140" cy="116" r="3.5" />
        <circle cx="155" cy="106" r="3.5" />
      </g>
      <path
        d="M306 170c14-3 26 1 33 10"
        stroke="#111111"
        strokeOpacity="0.18"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
