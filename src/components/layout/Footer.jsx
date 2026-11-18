import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Footprints, Play, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './Footer.module.css';

const SHOP_LINKS = [
  { to: '/products', label: 'All sneakers' },
  { to: '/products?sort=newest', label: 'New arrivals' },
  { to: '/products?category=Running', label: 'Running' },
  { to: '/products?category=Lifestyle', label: 'Lifestyle' },
];

const BASE_ACCOUNT_LINKS = [
  { to: '/cart', label: 'Your cart' },
  { to: '/orders', label: 'Order history' },
];

/** Storefront footer. */
export default function Footer() {
  const { user, isAdmin, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const accountLinks = isAdmin
    ? [...BASE_ACCOUNT_LINKS, { to: '/admin', label: 'Admin dashboard' }]
    : BASE_ACCOUNT_LINKS;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out.');
    navigate('/');
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo} aria-label="FootWear home">
            <span className={styles.logoMark}>
              <Footprints size={18} aria-hidden="true" />
            </span>
            Foot<span className={styles.accent}>Wear</span>
          </Link>
          <p className={styles.blurb}>
            Minimal sneakers, honest prices, delivered to your door. Cash on Delivery, no fuss.
          </p>
          <div className={styles.socials}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="FootWear on Instagram">
              <AtSign size={18} aria-hidden="true" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="FootWear on Twitter">
              <Send size={18} aria-hidden="true" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="FootWear on YouTube">
              <Play size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h2 className={styles.heading}>Shop</h2>
            {SHOP_LINKS.map((link) => (
              <Link key={link.label} to={link.to} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <h2 className={styles.heading}>Account</h2>
            {accountLinks.map((link) => (
              <Link key={link.label} to={link.to} className={styles.link}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <button type="button" className={`${styles.link} ${styles.signOut}`} onClick={handleSignOut}>
                Sign out
              </button>
            ) : (
              <Link to="/login" className={styles.link}>
                Sign in
              </Link>
            )}
          </div>

          <div className={styles.column}>
            <h2 className={styles.heading}>Good to know</h2>
            <p className={styles.note}>Cash on Delivery on every order.</p>
            <p className={styles.note}>Free delivery over ₹4,999.</p>
            <p className={styles.note}>Easy size exchange within 7 days.</p>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} FootWear. Academic project demo.</p>
        <p>Made with React, Vite and InsForge.</p>
      </div>
    </footer>
  );
}
