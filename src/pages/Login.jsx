import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Footprints, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { isDemoMode } from '../lib/dataClient';
import { DEMO_CREDENTIALS } from '../lib/seedData';
import { validateAuth } from '../utils/validators';
import styles from './Auth.module.css';

/** Sign-in page. */
export default function Login() {
  useDocumentTitle('Sign in');
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from || '/';

  if (user) return <Navigate to={from} replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const authenticate = async (credentials) => {
    setSubmitting(true);
    setFormError('');
    try {
      await signIn(credentials);
      toast.success('Welcome back.');
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateAuth(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    authenticate(values);
  };

  const useDemoAccount = (role) => {
    const credentials = DEMO_CREDENTIALS[role];
    setValues({ email: credentials.email, password: credentials.password });
    authenticate(credentials);
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand} aria-label="FootWear home">
          <span className={styles.brandMark}>
            <Footprints size={18} aria-hidden="true" />
          </span>
          Foot<span className={styles.brandAccent}>Wear</span>
        </Link>

        <div className={styles.heading}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to check out and follow your orders.</p>
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="Email address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <div className={styles.passwordField}>
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
              placeholder="Your password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>

          <Button type="submit" size="lg" fullWidth loading={submitting} icon={LogIn}>
            Sign in
          </Button>
        </form>

        {isDemoMode ? (
          <div className={styles.demo}>
            <p className={styles.demoTitle}>Demo mode</p>
            <p className={styles.demoCopy}>
              No backend is connected, so you can jump straight in with a sample account.
            </p>
            <div className={styles.demoActions}>
              <button type="button" onClick={() => useDemoAccount('customer')} disabled={submitting}>
                Customer demo
              </button>
              <button type="button" onClick={() => useDemoAccount('admin')} disabled={submitting}>
                Admin demo
              </button>
            </div>
          </div>
        ) : null}

        <p className={styles.switch}>
          New to FootWear? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
