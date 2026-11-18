import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Footprints,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import Drawer from '../ui/Drawer';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Collections' },
  { to: '/products?sort=newest', label: 'New Arrivals', query: true },
];

/**
 * Sticky storefront navbar with search, cart and account menu.
 */
export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
    setSearchOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('You have been signed out.');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const initials = (profile?.full_name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.logo} aria-label="FootWear home">
          <span className={styles.logoMark}>
            <Footprints size={20} aria-hidden="true" />
          </span>
          <span className={styles.logoText}>
            Foot<span>Wear</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map((link) =>
            link.query ? (
              <Link key={link.label} to={link.to} className={styles.navLink}>
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
          </button>

          <button
            type="button"
            className={styles.cartButton}
            onClick={cart.openDrawer}
            aria-label={`Open cart with ${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {cart.itemCount > 0 ? <span className={styles.cartCount}>{cart.itemCount > 99 ? '99+' : cart.itemCount}</span> : null}
          </button>

          {user ? (
            <div className={styles.account} ref={menuRef}>
              <button
                type="button"
                className={styles.avatarButton}
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className={styles.avatar}>{initials}</span>
                <ChevronDown size={14} aria-hidden="true" className={styles.chevron} />
                <span className="srOnly">Account menu</span>
              </button>
              {menuOpen ? (
                <div className={styles.menu} role="menu">
                  <div className={styles.menuHeader}>
                    <p className={styles.menuName}>{profile?.full_name || 'Sneaker fan'}</p>
                    <p className={styles.menuEmail}>{user.email}</p>
                  </div>
                  <Link to="/orders" className={styles.menuItem} role="menuitem">
                    <Package size={16} aria-hidden="true" /> My orders
                  </Link>
                  {isAdmin ? (
                    <Link to="/admin" className={styles.menuItem} role="menuitem">
                      <LayoutDashboard size={16} aria-hidden="true" /> Admin dashboard
                    </Link>
                  ) : null}
                  <button type="button" className={styles.menuItem} onClick={handleSignOut} role="menuitem">
                    <LogOut size={16} aria-hidden="true" /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" className={styles.signIn}>
              <User size={18} aria-hidden="true" />
              <span>Sign in</span>
            </Link>
          )}

          <button
            type="button"
            className={`${styles.iconButton} ${styles.burger}`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className={styles.searchPanel}>
          <form className={`container ${styles.searchForm}`} onSubmit={submitSearch} role="search">
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input
              ref={searchRef}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search for a sneaker, brand or category"
              aria-label="Search products"
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchSubmit}>
              Search
            </button>
          </form>
        </div>
      ) : null}

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu" width="sm">
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link to="/cart" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
            Cart {cart.itemCount > 0 ? `(${cart.itemCount})` : ''}
          </Link>
          <div className={styles.mobileDivider} />
          {user ? (
            <>
              <Link to="/orders" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                My orders
              </Link>
              {isAdmin ? (
                <Link to="/admin" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  Admin dashboard
                </Link>
              ) : null}
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className={styles.mobileLinkAccent} onClick={() => setMobileOpen(false)}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </Drawer>
    </header>
  );
}
