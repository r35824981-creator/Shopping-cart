import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

/** Only allows admins through; everyone else is sent to the storefront. */
export default function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="container page" style={{ display: 'flex', justifyContent: 'center' }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
