import { dataClient } from '../lib/dataClient';

/**
 * Fetch products with search, filters and sorting.
 * @param {object} query
 * @returns {Promise<Array<object>>}
 */
export async function fetchProducts(query = {}) {
  return dataClient.products.list(query);
}

/**
 * Fetch the featured products for the home page.
 * @param {number} limit
 * @returns {Promise<Array<object>>}
 */
export async function fetchFeaturedProducts(limit = 4) {
  return dataClient.products.getFeatured(limit);
}

/**
 * Fetch one product by slug.
 * @param {string} slug
 * @returns {Promise<object>}
 */
export async function fetchProductBySlug(slug) {
  if (!slug) throw new Error('Product not found.');
  return dataClient.products.getBySlug(slug);
}

/**
 * Fetch the categories, brands and price range used by the filters.
 * @returns {Promise<{categories: string[], brands: string[], priceRange: {min: number, max: number}}>}
 */
export async function fetchFilterOptions() {
  return dataClient.products.filterOptions();
}

/**
 * Fetch every product (including inactive) for the admin list.
 * @returns {Promise<Array<object>>}
 */
export async function fetchAllProducts() {
  return dataClient.products.listAll();
}

/**
 * Fetch one product by id, including inactive products (admin only).
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchProductById(id) {
  if (!id) throw new Error('Product not found.');
  return dataClient.products.getById(id);
}

/**
 * Create a product with its size rows.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createProduct(payload) {
  return dataClient.products.create(payload);
}

/**
 * Update a product and replace its size rows.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateProduct(id, payload) {
  return dataClient.products.update(id, payload);
}

/**
 * Delete a product.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  await dataClient.products.remove(id);
}
