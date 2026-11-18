import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  addToCart as addToCartRequest,
  clearCart as clearCartRequest,
  fetchCart,
  removeCartItem as removeCartItemRequest,
  updateCartQuantity as updateCartQuantityRequest,
} from '../services/cartService';
import { calculateTotals } from '../utils/cart';

const CartContext = createContext(null);

/**
 * Holds the signed-in user's cart and the quick-cart drawer state.
 * @param {{ children: React.ReactNode }} props
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return [];
    }
    setLoading(true);
    try {
      const nextItems = await fetchCart(user.id);
      setItems(nextItems);
      return nextItems;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh().catch(() => setItems([]));
  }, [refresh]);

  const addItem = useCallback(
    async (productId, size, quantity = 1) => {
      if (!user) throw new Error('Sign in to add items to your cart.');
      const result = await addToCartRequest(user.id, { productId, size, quantity });
      await refresh();
      return result;
    },
    [user, refresh],
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (!user) return;
      await updateCartQuantityRequest(user.id, itemId, quantity);
      await refresh();
    },
    [user, refresh],
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!user) return;
      await removeCartItemRequest(user.id, itemId);
      await refresh();
    },
    [user, refresh],
  );

  const clear = useCallback(async () => {
    if (!user) return;
    await clearCartRequest(user.id);
    await refresh();
  }, [user, refresh]);

  const totals = useMemo(() => calculateTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      loading,
      ...totals,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clear,
      refresh,
    }),
    [items, loading, totals, drawerOpen, addItem, updateQuantity, removeItem, clear, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Access the cart state and actions.
 * @returns {object}
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
