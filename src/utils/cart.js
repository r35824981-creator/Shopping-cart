export const DELIVERY_FEE = 149;
export const FREE_DELIVERY_THRESHOLD = 4999;

/**
 * Calculate cart or order totals in one place.
 * @param {Array<{ price: number, quantity: number }>} items
 * @returns {{ subtotal: number, delivery: number, total: number, itemCount: number }}
 */
export function calculateTotals(items = []) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  const itemCount = items.reduce((count, item) => count + (Number(item.quantity) || 0), 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  return {
    subtotal,
    delivery,
    total: subtotal + delivery,
    itemCount,
  };
}
