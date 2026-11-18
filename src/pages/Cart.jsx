import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import CartLine from '../components/cart/CartLine';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Cart.module.css';

/** Full cart review page. */
export default function Cart() {
  useDocumentTitle('Your cart');
  const cart = useCart();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const changeQuantity = async (itemId, quantity) => {
    setBusyId(itemId);
    try {
      await cart.updateQuantity(itemId, quantity);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (itemId) => {
    const item = cart.items.find((entry) => entry.id === itemId);
    setBusyId(itemId);
    try {
      await cart.removeItem(itemId);
      toast.success(`${item?.name || 'Item'} removed from your cart.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container">
      <header className="pageHeader">
        <div className={styles.heading}>
          <p className="eyebrow">Cart</p>
          <h1 className={styles.title}>Your cart</h1>
          <p className={styles.subtitle}>
            {cart.itemCount === 0
              ? 'Nothing here yet.'
              : `${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'} ready for checkout.`}
          </p>
        </div>
        <Link to="/products" className={styles.continue}>
          Continue shopping
        </Link>
      </header>

      {cart.loading && cart.items.length === 0 ? (
        <div className={styles.loading}>
          <Spinner size={28} />
        </div>
      ) : cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the collection and pick a pair to get started."
        >
          <Button to="/products" icon={ArrowRight} iconAfter>
            Browse sneakers
          </Button>
        </EmptyState>
      ) : (
        <div className={styles.layout}>
          <section className={styles.items} aria-label="Cart items">
            {cart.items.map((item) => (
              <CartLine
                key={item.id}
                item={item}
                busy={busyId === item.id}
                onQuantityChange={changeQuantity}
                onRemove={remove}
              />
            ))}
          </section>

          <div className={styles.summaryColumn}>
            <CartSummary totals={cart}>
              <Button to="/checkout" size="lg" fullWidth icon={ArrowRight} iconAfter>
                Checkout
              </Button>
              <Button to="/products" variant="ghost" fullWidth>
                Keep shopping
              </Button>
            </CartSummary>
          </div>
        </div>
      )}
    </div>
  );
}
