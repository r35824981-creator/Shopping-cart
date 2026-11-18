import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import QuantityStepper from '../product/QuantityStepper';
import ProductImage from '../product/ProductImage';
import EmptyState from '../ui/EmptyState';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';
import styles from './CartDrawer.module.css';

/** Quick-cart drawer opened from the navbar. */
export default function CartDrawer() {
  const cart = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const goTo = (path) => {
    cart.closeDrawer();
    navigate(path);
  };

  const changeQuantity = async (item, quantity) => {
    setBusyId(item.id);
    try {
      await cart.updateQuantity(item.id, quantity);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    setBusyId(item.id);
    try {
      await cart.removeItem(item.id);
      toast.success(`${item.name} removed from your cart.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Drawer
      open={cart.drawerOpen}
      onClose={cart.closeDrawer}
      title={`Your cart${cart.itemCount ? ` (${cart.itemCount})` : ''}`}
      footer={
        cart.items.length > 0 ? (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <strong>{formatPrice(cart.subtotal)}</strong>
            </div>
            <p className={styles.footNote}>Delivery is calculated at checkout.</p>
            <div className={styles.footerActions}>
              <Button variant="outline" fullWidth onClick={() => goTo('/cart')}>
                View cart
              </Button>
              <Button fullWidth onClick={() => goTo('/checkout')}>
                Checkout
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {cart.loading && cart.items.length === 0 ? (
        <p className={styles.loading}>Loading your cart...</p>
      ) : cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Pick a pair you love and it will show up here."
        >
          <Button onClick={() => goTo('/products')}>Browse sneakers</Button>
        </EmptyState>
      ) : (
        <ul className={styles.lines}>
          {cart.items.map((item) => (
            <li key={item.id} className={styles.line}>
              <ProductImage src={item.image_url} name={item.name} className={styles.media} />
              <div className={styles.info}>
                <div className={styles.top}>
                  <div>
                    <h3 className={styles.name}>{item.name}</h3>
                    <p className={styles.meta}>Size {item.size}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => remove(item)}
                    disabled={busyId === item.id}
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className={styles.bottom}>
                  <QuantityStepper
                    value={item.quantity}
                    max={Math.max(item.quantity, item.stock, 1)}
                    disabled={busyId === item.id}
                    onChange={(next) => changeQuantity(item, next)}
                    label={`Quantity for ${item.name}`}
                  />
                  <span className={styles.price}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
