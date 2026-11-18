/**
 * Turn a product name into a URL-friendly slug.
 * @param {string} value
 * @returns {string}
 */
export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
