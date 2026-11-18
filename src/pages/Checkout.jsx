import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Lock, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import OrderSummary from '../components/checkout/OrderSummary';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { placeOrder } from '../services/orderService';
import { validateCheckout } from '../utils/validators';
import styles from './Checkout.module.css';

const EMPTY_FORM = { deliveryName: '', deliveryPhone: '', deliveryAddress: '' };

/** Checkout form: delivery details plus Cash on Delivery confirmation. */
export default function Checkout() {
  useDocumentTitle('Checkout');
  const { user, profile } = useAuth();
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setValues((current) => ({
      ...current,
      deliveryName: current.deliveryName || profile.full_name || '',
      deliveryPhone: current.deliveryPhone || profile.phone || '',
    }));
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError('');
    try {
      const order = await placeOrder({
        userId: user.id,
        deliveryName: values.deliveryName,
        deliveryPhone: values.deliveryPhone,
        deliveryAddress: values.deliveryAddress,
      });
      await cart.refresh().catch(() => {});
      toast.success('Order placed. Pay when it arrives.');
      navigate(`/orders/${order.id}?placed=1`, { replace: true });
    } catch (error) {
      setServerError(error.message || 'Could not place your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.loading && cart.items.length === 0) {
    return (
      <div className={`container ${styles.loading}`}>
        <Spinner size={28} />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add a pair to your cart before checking out."
        >
          <Button to="/products">Browse sneakers</Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/cart" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to cart
      </Link>

      <header className={styles.header}>
        <p className="eyebrow">Checkout</p>
        <h1 className={styles.title}>Almost there</h1>
        <p className={styles.subtitle}>Add your delivery details and confirm the order.</p>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Delivery details</h2>
            <div className={styles.fields}>
              <Input
                label="Full name"
                name="deliveryName"
                value={values.deliveryName}
                onChange={handleChange}
                error={errors.deliveryName}
                autoComplete="name"
                placeholder="Who should we deliver to?"
              />
              <Input
                label="Phone number"
                name="deliveryPhone"
                type="tel"
                inputMode="tel"
                value={values.deliveryPhone}
                onChange={handleChange}
                error={errors.deliveryPhone}
                autoComplete="tel"
                placeholder="10-digit mobile number"
                hint="We will call this number before delivery."
              />
              <Textarea
                label="Delivery address"
                name="deliveryAddress"
                value={values.deliveryAddress}
                onChange={handleChange}
                error={errors.deliveryAddress}
                rows={4}
                autoComplete="street-address"
                placeholder="House number, street, area, city, state and PIN code"
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment</h2>
            <div className={styles.payment}>
              <span className={styles.paymentIcon}>
                <Banknote size={22} aria-hidden="true" />
              </span>
              <div className={styles.paymentCopy}>
                <div className={styles.paymentTop}>
                  <p className={styles.paymentTitle}>Cash on Delivery</p>
                  <Badge variant="success">Selected</Badge>
                </div>
                <p className={styles.paymentText}>
                  Pay in cash when your order reaches your door. No card or online payment needed.
                </p>
              </div>
            </div>
          </section>

          {serverError ? (
            <p className={styles.serverError} role="alert">
              {serverError}
            </p>
          ) : null}

          <Button type="submit" size="lg" fullWidth loading={submitting} icon={Lock}>
            Place COD order
          </Button>
          <p className={styles.terms}>
            By placing this order you agree to pay the total amount on delivery.
          </p>
        </form>

        <div className={styles.summary}>
          <OrderSummary items={cart.items} totals={cart} />
        </div>
      </div>
    </div>
  );
}
