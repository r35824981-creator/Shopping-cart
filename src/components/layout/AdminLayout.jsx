import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Footprints, LayoutDashboard, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './AdminLayout.module.css';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
];

/** Shell for the admin dashboard. */
export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('You have been signed out.');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/admin" className={styles.logo} aria-label="FootWear admin home">
          <span className={styles.logoMark}>
            <Footprints size={18} aria-hidden="true" />
          </span>
          <span>
            Foot<span className={styles.accent}>Wear</span>
          </span>
        </Link>
        <p className={styles.adminTag}>Admin panel</p>

        <nav className={styles.nav} aria-label="Admin navigation">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sideFooter}>
          <Link to="/" className={styles.storeLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to store
          </Link>
          <div className={styles.user}>
            <span className={styles.avatar}>{(profile?.full_name || 'A').charAt(0).toUpperCase()}</span>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{profile?.full_name || 'Admin'}</p>
              <p className={styles.userRole}>Store manager</p>
            </div>
            <button type="button" className={styles.logout} onClick={handleSignOut} aria-label="Sign out">
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.topLabel}>FootWear</p>
            <p className={styles.topTitle}>Store management</p>
          </div>
          <Link to="/" className={styles.viewStore}>
            View store
          </Link>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
