const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Format a numeric amount as Indian rupees.
 * @param {number} amount
 * @returns {string} e.g. "₹12,499"
 */
export function formatPrice(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return currencyFormatter.format(0);
  return currencyFormatter.format(value);
}

/**
 * Format an ISO date as a short readable date.
 * @param {string} value
 * @returns {string} e.g. "18 Nov 2026"
 */
export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an ISO date as a readable date with time.
 * @param {string} value
 * @returns {string}
 */
export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Derive a short human-friendly order number from an order id.
 * @param {string} id
 * @returns {string} e.g. "FW-3F9A21"
 */
export function formatOrderNumber(id = '') {
  const compact = String(id).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `FW-${compact.slice(-6).padStart(6, '0')}`;
}
