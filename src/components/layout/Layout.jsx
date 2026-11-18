import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';

/** Storefront shell: navbar, page content, footer and the quick cart. */
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
