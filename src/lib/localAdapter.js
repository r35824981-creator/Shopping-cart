import { SEED_ORDERS, SEED_PRODUCTS, SEED_USERS } from './seedData';
import { ORDER_STATUSES } from './constants';
import { calculateTotals } from '../utils/cart';
import { slugify } from '../utils/slugify';

const STATE_KEY = 'footwear.demo.state.v1';
const SESSION_KEY = 'footwear.demo.session.v1';

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

const newId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const sizeRowId = (productId, size) => `ps-${productId}-${slugify(size)}`;

const normalizeUsers = (users) =>
  users.map((user) => ({
    ...user,
    full_name: user.full_name || user.fullName || '',
  }));

const buildSeedState = () => {
  const products = SEED_PRODUCTS.map(({ sizes, ...product }) => ({ ...product }));
  const productSizes = SEED_PRODUCTS.flatMap((product) =>
    product.sizes.map((entry) => ({
      id: sizeRowId(product.id, entry.size),
      product_id: product.id,
      size: entry.size,
      stock: entry.stock,
    })),
  );

  const orders = SEED_ORDERS.map(({ items, ...order }) => ({ ...order }));
  const orderItems = SEED_ORDERS.flatMap((order) =>
    order.items.map((item, index) => ({
      id: `oi-${order.id}-${index}`,
      order_id: order.id,
      ...item,
    })),
  );

  return {
    version: 1,
    users: normalizeUsers(SEED_USERS),
    products,
    product_sizes: productSizes,
    cart_items: [],
    orders,
    order_items: orderItems,
    uploaded_images: {},
  };
};

const readState = () => {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
};

let memoryState = null;

const getState = () => {
  if (memoryState) return memoryState;
  let state = readState();
  if (!state) {
    state = buildSeedState();
    writeState(state);
  }
  state.users = normalizeUsers(state.users);
  memoryState = state;
  return state;
};

const writeState = (state) => {
  memoryState = state;
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    throw new Error('Local demo storage is full. Remove a product image or clear the demo data.');
  }
};

const toProfile = (user) => ({
  id: user.id,
  full_name: user.full_name,
  phone: user.phone,
  role: user.role,
  created_at: user.created_at,
});

const readSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const writeSession = (session) => {
  if (!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const withSizes = (state, product) => ({
  ...product,
  sizes: state.product_sizes
    .filter((row) => row.product_id === product.id)
    .map(({ size, stock }) => ({ size, stock })),
});

const withOrderItems = (state, order) => ({
  ...order,
  order_items: state.order_items.filter((item) => item.order_id === order.id),
  customer: state.users.find((user) => user.id === order.user_id)?.full_name || 'Customer',
});

const requireProduct = (state, productId) => {
  const product = state.products.find((entry) => entry.id === productId);
  if (!product) throw new Error('This product is no longer available.');
  return product;
};

const requireSize = (state, productId, size) => {
  const row = state.product_sizes.find((entry) => entry.product_id === productId && entry.size === size);
  if (!row) throw new Error('That size is not available for this product.');
  if (row.stock < 1) throw new Error('That size is out of stock.');
  return row;
};

/**
 * In-browser demo backend. Mirrors the Supabase adapter contract so the app can
 * run without any backend credentials. Data lives in localStorage.
 * @returns {object} data adapter
 */
export function createLocalAdapter() {
  return {
    mode: 'demo',

    auth: {
      async getSession() {
        const session = readSession();
        if (!session) return null;
        const state = getState();
        const user = state.users.find((entry) => entry.id === session.userId);
        if (!user) return null;
        return {
          user: { id: user.id, email: user.email },
          profile: toProfile(user),
        };
      },

      async signUp({ email, password, fullName }) {
        await wait();
        const state = getState();
        const normalizedEmail = email.trim().toLowerCase();
        if (state.users.some((user) => user.email === normalizedEmail)) {
          throw new Error('An account with this email already exists.');
        }
        const user = {
          id: newId('user'),
          email: normalizedEmail,
          password,
          full_name: fullName.trim(),
          phone: '',
          role: 'customer',
          created_at: new Date().toISOString(),
        };
        state.users.push(user);
        writeState(state);
        writeSession({ userId: user.id });
        return { user: { id: user.id, email: user.email }, profile: toProfile(user) };
      },

      async signIn({ email, password }) {
        await wait();
        const state = getState();
        const normalizedEmail = email.trim().toLowerCase();
        const user = state.users.find((entry) => entry.email === normalizedEmail);
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password.');
        }
        writeSession({ userId: user.id });
        return { user: { id: user.id, email: user.email }, profile: toProfile(user) };
      },

      async signOut() {
        writeSession(null);
      },
    },

    products: {
      async list({ search = '', category = '', brands = [], minPrice = 0, maxPrice = 0, sort = 'featured', includeInactive = false } = {}) {
        await wait(120);
        const state = getState();
        const term = search.trim().toLowerCase();

        let items = state.products.filter((product) => {
          if (!includeInactive && !product.is_active) return false;
          if (category && product.category !== category) return false;
          if (brands.length > 0 && !brands.includes(product.brand)) return false;
          if (term && !`${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(term)) return false;
          if (minPrice > 0 && product.price < minPrice) return false;
          if (maxPrice > 0 && product.price > maxPrice) return false;
          return true;
        });

        const sorters = {
          featured: (a, b) => Number(b.is_featured) - Number(a.is_featured) || b.created_at.localeCompare(a.created_at),
          newest: (a, b) => b.created_at.localeCompare(a.created_at),
          'price-asc': (a, b) => a.price - b.price,
          'price-desc': (a, b) => b.price - a.price,
          'name-asc': (a, b) => a.name.localeCompare(b.name),
        };
        items = [...items].sort(sorters[sort] || sorters.featured);

        return items.map((product) => withSizes(state, product));
      },

      async getFeatured(limit = 4) {
        await wait(120);
        const state = getState();
        return state.products
          .filter((product) => product.is_active && product.is_featured)
          .slice(0, limit)
          .map((product) => withSizes(state, product));
      },

      async getBySlug(slug) {
        await wait(120);
        const state = getState();
        const product = state.products.find((entry) => entry.slug === slug && entry.is_active);
        if (!product) throw new Error('Product not found.');
        return withSizes(state, product);
      },

      async getById(id) {
        await wait(80);
        const state = getState();
        const product = state.products.find((entry) => entry.id === id);
        if (!product) throw new Error('Product not found.');
        return withSizes(state, product);
      },

      async filterOptions() {
        const state = getState();
        const active = state.products.filter((product) => product.is_active);
        return {
          categories: [...new Set(active.map((product) => product.category))].sort(),
          brands: [...new Set(active.map((product) => product.brand))].sort(),
          priceRange: {
            min: Math.min(...active.map((product) => product.price)),
            max: Math.max(...active.map((product) => product.price)),
          },
        };
      },

      async create(payload) {
        await wait();
        const state = getState();
        const baseSlug = slugify(payload.name);
        let slug = baseSlug;
        let suffix = 2;
        while (state.products.some((product) => product.slug === slug)) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        const product = {
          id: newId('prod'),
          name: payload.name.trim(),
          slug,
          description: payload.description.trim(),
          brand: payload.brand,
          category: payload.category,
          price: Number(payload.price),
          image_url: payload.imageUrl || '',
          is_featured: Boolean(payload.isFeatured),
          is_active: payload.isActive !== false,
          created_at: new Date().toISOString(),
        };
        state.products.unshift(product);
        payload.sizes.forEach((entry) => {
          state.product_sizes.push({
            id: sizeRowId(product.id, entry.size),
            product_id: product.id,
            size: entry.size,
            stock: Number(entry.stock) || 0,
          });
        });
        writeState(state);
        return withSizes(state, product);
      },

      async update(id, payload) {
        await wait();
        const state = getState();
        const product = requireProduct(state, id);
        Object.assign(product, {
          name: payload.name.trim(),
          description: payload.description.trim(),
          brand: payload.brand,
          category: payload.category,
          price: Number(payload.price),
          image_url: payload.imageUrl || '',
          is_featured: Boolean(payload.isFeatured),
          is_active: payload.isActive !== false,
        });
        state.product_sizes = state.product_sizes.filter((row) => row.product_id !== id);
        payload.sizes.forEach((entry) => {
          state.product_sizes.push({
            id: sizeRowId(id, entry.size),
            product_id: id,
            size: entry.size,
            stock: Number(entry.stock) || 0,
          });
        });
        writeState(state);
        return withSizes(state, product);
      },

      async remove(id) {
        await wait();
        const state = getState();
        state.products = state.products.filter((product) => product.id !== id);
        state.product_sizes = state.product_sizes.filter((row) => row.product_id !== id);
        state.cart_items = state.cart_items.filter((item) => item.product_id !== id);
        writeState(state);
      },

      async listAll() {
        await wait(120);
        const state = getState();
        return [...state.products]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((product) => withSizes(state, product));
      },
    },

    cart: {
      async list(userId) {
        const state = getState();
        return state.cart_items
          .filter((item) => item.user_id === userId)
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
          .map((item) => {
            const product = state.products.find((entry) => entry.id === item.product_id);
            const sizeRow = state.product_sizes.find(
              (entry) => entry.product_id === item.product_id && entry.size === item.size,
            );
            return {
              id: item.id,
              product_id: item.product_id,
              size: item.size,
              quantity: item.quantity,
              price: product?.price ?? 0,
              name: product?.name ?? 'Unavailable product',
              image_url: product?.image_url ?? '',
              slug: product?.slug ?? '',
              stock: sizeRow?.stock ?? 0,
              is_active: Boolean(product?.is_active),
            };
          });
      },

      async add(userId, { productId, size, quantity = 1 }) {
        await wait(120);
        const state = getState();
        const product = requireProduct(state, productId);
        const sizeRow = requireSize(state, productId, size);

        const existing = state.cart_items.find(
          (item) => item.user_id === userId && item.product_id === productId && item.size === size,
        );
        const nextQuantity = (existing?.quantity || 0) + Number(quantity);

        if (nextQuantity > sizeRow.stock) {
          throw new Error(`Only ${sizeRow.stock} pair(s) left in ${size}.`);
        }

        if (existing) {
          existing.quantity = nextQuantity;
        } else {
          state.cart_items.push({
            id: newId('cart'),
            user_id: userId,
            product_id: productId,
            size,
            quantity: nextQuantity,
            created_at: new Date().toISOString(),
          });
        }
        writeState(state);
        return { productName: product.name, quantity: Number(quantity) };
      },

      async updateQuantity(userId, itemId, quantity) {
        await wait(80);
        const state = getState();
        const item = state.cart_items.find((entry) => entry.id === itemId && entry.user_id === userId);
        if (!item) throw new Error('Cart item not found.');
        if (quantity < 1) throw new Error('Quantity must be at least 1.');
        const sizeRow = state.product_sizes.find(
          (entry) => entry.product_id === item.product_id && entry.size === item.size,
        );
        if (sizeRow && quantity > sizeRow.stock) {
          throw new Error(`Only ${sizeRow.stock} pair(s) left in ${item.size}.`);
        }
        item.quantity = Number(quantity);
        writeState(state);
        return item;
      },

      async remove(userId, itemId) {
        await wait(80);
        const state = getState();
        state.cart_items = state.cart_items.filter((entry) => !(entry.id === itemId && entry.user_id === userId));
        writeState(state);
      },

      async clear(userId) {
        const state = getState();
        state.cart_items = state.cart_items.filter((entry) => entry.user_id !== userId);
        writeState(state);
      },
    },

    orders: {
      async place({ userId, deliveryName, deliveryPhone, deliveryAddress }) {
        await wait(320);
        const state = getState();
        const cartItems = state.cart_items.filter((item) => item.user_id === userId);
        if (cartItems.length === 0) throw new Error('Your cart is empty.');

        const lines = cartItems.map((item) => {
          const product = requireProduct(state, item.product_id);
          return { item, product };
        });

        const totals = calculateTotals(lines.map(({ item, product }) => ({ price: product.price, quantity: item.quantity })));
        const orderId = newId('ord');
        const createdAt = new Date().toISOString();

        const order = {
          id: orderId,
          user_id: userId,
          status: 'pending',
          total_amount: totals.total,
          payment_method: 'COD',
          delivery_name: deliveryName.trim(),
          delivery_phone: deliveryPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          created_at: createdAt,
        };

        const orderItems = lines.map(({ item, product }) => ({
          id: newId('oi'),
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          image_url: product.image_url,
          size: item.size,
          quantity: item.quantity,
          unit_price: product.price,
        }));

        state.orders.push(order);
        state.order_items.push(...orderItems);
        state.cart_items = state.cart_items.filter((item) => item.user_id !== userId);
        writeState(state);

        return withOrderItems(state, order);
      },

      async listMine(userId) {
        await wait(120);
        const state = getState();
        return state.orders
          .filter((order) => order.user_id === userId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((order) => withOrderItems(state, order));
      },

      async getById(orderId, { userId, isAdmin }) {
        await wait(80);
        const state = getState();
        const order = state.orders.find((entry) => entry.id === orderId);
        if (!order) throw new Error('Order not found.');
        if (!isAdmin && order.user_id !== userId) throw new Error('Order not found.');
        return withOrderItems(state, order);
      },

      async listAll() {
        await wait(140);
        const state = getState();
        return [...state.orders]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((order) => withOrderItems(state, order));
      },

      async updateStatus(orderId, status) {
        await wait(120);
        if (!ORDER_STATUSES.includes(status)) throw new Error('Unknown order status.');
        const state = getState();
        const order = state.orders.find((entry) => entry.id === orderId);
        if (!order) throw new Error('Order not found.');
        order.status = status;
        writeState(state);
        return withOrderItems(state, order);
      },
    },

    storage: {
      async uploadProductImage(dataUrl) {
        await wait(150);
        return dataUrl;
      },
    },

    demo: {
      reset() {
        window.localStorage.removeItem(STATE_KEY);
        window.localStorage.removeItem(SESSION_KEY);
        memoryState = null;
      },
    },
  };
}
