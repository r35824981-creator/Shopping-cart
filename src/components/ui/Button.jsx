import { Link } from 'react-router-dom';
import Spinner from './Spinner';
import styles from './Button.module.css';

/**
 * Primary action button. Renders a router link when `to` is provided.
 * @param {object} props
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  to,
  type = 'button',
  className = '',
  icon: Icon,
  iconAfter = false,
  ...rest
}) {
  const classes = [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <Spinner size={16} />
      ) : Icon && !iconAfter ? (
        <Icon size={18} aria-hidden="true" />
      ) : null}
      <span>{children}</span>
      {Icon && iconAfter && !loading ? <Icon size={18} aria-hidden="true" /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
