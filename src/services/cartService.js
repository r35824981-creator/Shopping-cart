import { dataClient } from '../lib/dataClient';

/**
 * Get the signed-in user's cart with product details.
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export async function fetchCart(userId) {
  if (!userId) return [];
  return dataClient.cart.list(userId);
}

/**
 * Add a product size to the cart.
 * @param {string} userId
 * @param {{ productId: string, size: string, quantity: number }} item
 * @returns {Promise<void>}
 */
export async function addToCart(userId, item) {
  if (!userId) throw new Error('Sign in to add items to your cart.');
  await dataClient.cart.add(userId, item);
}

/**
 * Change the quantity of a cart line.
 * @param {string} userId
 * @param {string} itemId
 * @param {number} quantity
 * @returns {Promise<void>}
 */
export async function updateCartQuantity(userId, itemId, quantity) {
  await dataClient.cart.updateQuantity(userId, itemId, quantity);
}

/**
 * Remove one cart line.
 * @param {string} userId
 * @param {string} itemId
 * @returns {Promise<void>}
 */
export async function removeCartItem(userId, itemId) {
  await dataClient.cart.remove(userId, itemId);
}

/**
 * Remove every line from the cart.
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function clearCart(userId) {
  await dataClient.cart.clear(userId);
}
