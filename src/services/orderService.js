import { dataClient } from '../lib/dataClient';

/**
 * Place a Cash on Delivery order from the current cart.
 * @param {{ userId: string, deliveryName: string, deliveryPhone: string, deliveryAddress: string }} details
 * @returns {Promise<object>}
 */
export async function placeOrder(details) {
  if (!details.userId) throw new Error('Sign in to place an order.');
  return dataClient.orders.place(details);
}

/**
 * Fetch the signed-in user's order history.
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export async function fetchMyOrders(userId) {
  if (!userId) return [];
  return dataClient.orders.listMine(userId);
}

/**
 * Fetch one order, checking ownership unless the caller is an admin.
 * @param {string} orderId
 * @param {{ userId: string, isAdmin: boolean }} access
 * @returns {Promise<object>}
 */
export async function fetchOrder(orderId, access) {
  return dataClient.orders.getById(orderId, access);
}

/**
 * Fetch every order for the admin dashboard.
 * @returns {Promise<Array<object>>}
 */
export async function fetchAllOrders() {
  return dataClient.orders.listAll();
}

/**
 * Update an order status (admin only).
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<void>}
 */
export async function updateOrderStatus(orderId, status) {
  await dataClient.orders.updateStatus(orderId, status);
}
