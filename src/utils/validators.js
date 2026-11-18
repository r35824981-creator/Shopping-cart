/**
 * Basic email check shared by the auth forms.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

/**
 * Indian mobile numbers: 10 digits, starting 6-9.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidPhone(value = '') {
  return /^[6-9]\d{9}$/.test(String(value).replace(/[\s-]/g, ''));
}

/**
 * Validate the delivery form for checkout.
 * @param {{ deliveryName: string, deliveryPhone: string, deliveryAddress: string }} values
 * @returns {Record<string, string>} field name to error message
 */
export function validateCheckout(values) {
  const errors = {};
  if (!values.deliveryName.trim()) errors.deliveryName = 'Enter the recipient name.';
  else if (values.deliveryName.trim().length < 3) errors.deliveryName = 'Name must be at least 3 characters.';

  if (!values.deliveryPhone.trim()) errors.deliveryPhone = 'Enter a phone number.';
  else if (!isValidPhone(values.deliveryPhone)) errors.deliveryPhone = 'Enter a valid 10-digit mobile number.';

  if (!values.deliveryAddress.trim()) errors.deliveryAddress = 'Enter the delivery address.';
  else if (values.deliveryAddress.trim().length < 12) errors.deliveryAddress = 'Address must be at least 12 characters.';

  return errors;
}

/**
 * Validate an auth form.
 * @param {{ fullName?: string, email: string, password: string }} values
 * @param {boolean} requireName
 * @returns {Record<string, string>}
 */
export function validateAuth(values, requireName = false) {
  const errors = {};
  if (requireName) {
    if (!values.fullName?.trim()) errors.fullName = 'Enter your full name.';
    else if (values.fullName.trim().length < 3) errors.fullName = 'Name must be at least 3 characters.';
  }

  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';

  if (!values.password) errors.password = 'Enter a password.';
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.';

  return errors;
}
