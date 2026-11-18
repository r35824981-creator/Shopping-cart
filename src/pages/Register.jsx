import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Footprints, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { validateAuth } from '../utils/validators';
import styles from './Auth.module.css';

/** Registration page. */
export default function Register() {
  useDocumentTitle('Create account');
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAuth(values, true);
    if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');
    try {
      await signUp({ fullName: values.fullName, email: values.email, password: values.password });
      toast.success('Account created. Welcome to FootWear.');
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(error.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
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
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>One account for the cart, checkout and order history.</p>
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            error={errors.fullName}
            autoComplete="name"
            placeholder="Your name"
          />
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
          <Input
            label="Confirm password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="Repeat your password"
          />

          <Button type="submit" size="lg" fullWidth loading={submitting} icon={UserPlus}>
            Create account
          </Button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
