import { ORDER_STATUSES } from './constants';

const PRODUCT_COLUMNS = `
  id, name, slug, description, brand, category, price, image_url,
  is_featured, is_active, created_at, product_sizes ( size, stock )
`;

const ORDER_COLUMNS = `
  id, user_id, status, total_amount, payment_method, delivery_name,
  delivery_phone, delivery_address, created_at,
  order_items ( id, product_id, product_name, image_url, size, quantity, unit_price )
`;

/**
 * Throw a friendly error when a Supabase/PostgREST call fails.
 * @param {{ data: unknown, error: { message?: string } | null }} response
 * @returns {any}
 */
function unwrap({ data, error }) {
  if (error) {
    throw new Error(error.message || 'We could not reach the store right now.');
  }
  return data;
}

/**
 * Supabase auth errors are developer-oriented ("Email not confirmed"); turn the
 * common ones into something a shopper can act on.
 * @param {{ message?: string, code?: string } | null} error
 * @param {string} fallback
 * @returns {string}
 */
function authMessage(error, fallback) {
  const message = error?.message || '';
  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email address, then sign in.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Invalid email or password.';
  }
  if (/user already registered/i.test(message)) {
    return 'An account with that email already exists.';
  }
  if (/password should be at least/i.test(message)) {
    return message;
  }
  return message || fallback;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
export function createSupabaseAdapter(client) {
  const db = client;

  const mapProduct = (row) => ({
    ...row,
    sizes: (row.product_sizes || []).map(({ size, stock }) => ({ size, stock })),
  });

  const mapOrder = (row) => ({
    ...row,
    order_items: row.order_items || [],
    customer: row.profiles?.full_name || 'Customer',
  });

  /** @param {string} userId */
  const fetchProfile = async (userId) =>
    unwrap(
      await db
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .eq('id', userId)
        .maybeSingle(),
    );

  /** @param {string} userId @param {string} [email] */
  const fallbackProfile = (userId, email) => ({
    id: userId,
    full_name: email?.split('@')[0] || 'Customer',
    phone: '',
    role: 'customer',
    created_at: new Date().toISOString(),
  });

  const loadProfile = async (userId, email) =>
    (await fetchProfile(userId)) || fallbackProfile(userId, email);

  const writeSizes = async (productId, sizes) => {
    unwrap(await db.from('product_sizes').delete().eq('product_id', productId));
    if (sizes.length === 0) return;
    unwrap(
      await db.from('product_sizes').insert(
        sizes.map((entry) => ({
          product_id: productId,
          size: entry.size,
          stock: Number(entry.stock) || 0,
        })),
      ),
    );
  };

  return {
    mode: 'supabase',

    auth: {
      async getSession() {
        // getUser() validates the persisted token with the auth server, unlike
        // getSession() which only reads what is already in storage.
        const { data, error } = await client.auth.getUser();
        if (error || !data?.user) return null;
        const profile = await loadProfile(data.user.id, data.user.email);
        return { user: { id: data.user.id, email: data.user.email }, profile };
      },

      async signUp({ email, password, fullName }) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw new Error(authMessage(error, 'Could not create your account.'));

        const user = data?.user;
        if (!user) throw new Error('Could not create your account.');

        // With "Confirm email" enabled Supabase returns a user but no session.
        if (!data.session) {
          throw new Error('Account created. Check your inbox to confirm your email, then sign in.');
        }

        // A trigger on auth.users normally creates the profile. Insert it here
        // as a fallback so an account is never left without a profile row.
        const existing = await fetchProfile(user.id);
        if (!existing) {
          const { error: profileError } = await db.from('profiles').insert({
            id: user.id,
            full_name: fullName,
            phone: '',
            role: 'customer',
          });
          if (profileError) {
            throw new Error('Your account was created but the profile could not be saved. Sign in and try again.');
          }
        }

        return { user: { id: user.id, email }, profile: await loadProfile(user.id, email) };
      },

      async signIn({ email, password }) {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new Error(authMessage(error, 'Invalid email or password.'));
        const user = data?.user;
        if (!user) throw new Error('Invalid email or password.');
        return { user: { id: user.id, email }, profile: await loadProfile(user.id, email) };
      },

      async signOut() {
        await client.auth.signOut();
      },
    },

    products: {
      async list({ search = '', category = '', brands = [], minPrice = 0, maxPrice = 0, sort = 'featured', includeInactive = false } = {}) {
        let query = db.from('products').select(PRODUCT_COLUMNS);
        if (!includeInactive) query = query.eq('is_active', true);
        if (category) query = query.eq('category', category);
        if (brands.length > 0) query = query.in('brand', brands);
        if (search.trim()) {
          const term = search.trim().replace(/[%_]/g, '');
          query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`);
        }
        if (minPrice > 0) query = query.gte('price', minPrice);
        if (maxPrice > 0) query = query.lte('price', maxPrice);

        if (sort === 'price-asc') query = query.order('price', { ascending: true });
        else if (sort === 'price-desc') query = query.order('price', { ascending: false });
        else if (sort === 'name-asc') query = query.order('name', { ascending: true });
        else if (sort === 'newest') query = query.order('created_at', { ascending: false });
        else query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

        const rows = unwrap(await query.limit(60));
        return (rows || []).map(mapProduct);
      },

      async getFeatured(limit = 4) {
        const rows = unwrap(
          await db
            .from('products')
            .select(PRODUCT_COLUMNS)
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(limit),
        );
        return (rows || []).map(mapProduct);
      },

      async getBySlug(slug) {
        const row = unwrap(
          await db.from('products').select(PRODUCT_COLUMNS).eq('slug', slug).eq('is_active', true).maybeSingle(),
        );
        if (!row) throw new Error('Product not found.');
        return mapProduct(row);
      },

      async getById(id) {
        const row = unwrap(
          await db.from('products').select(PRODUCT_COLUMNS).eq('id', id).maybeSingle(),
        );
        if (!row) throw new Error('Product not found.');
        return mapProduct(row);
      },

      async filterOptions() {
        const rows =
          unwrap(await db.from('products').select('brand, category, price').eq('is_active', true)) || [];
        const prices = rows.map((row) => Number(row.price));
        return {
          categories: [...new Set(rows.map((row) => row.category))].filter(Boolean).sort(),
          brands: [...new Set(rows.map((row) => row.brand))].filter(Boolean).sort(),
          priceRange: {
            min: prices.length ? Math.min(...prices) : 0,
            max: prices.length ? Math.max(...prices) : 0,
          },
        };
      },

      async create(payload) {
        const { data, error } = await db
          .from('products')
          .insert({
            name: payload.name.trim(),
            slug: payload.slug,
            description: payload.description.trim(),
            brand: payload.brand,
            category: payload.category,
            price: Number(payload.price),
            image_url: payload.imageUrl || '',
            is_featured: Boolean(payload.isFeatured),
            is_active: payload.isActive !== false,
          })
          .select('id')
          .single();
        if (error) throw new Error('Could not save the product. Check the details and try again.');
        try {
          await writeSizes(data.id, payload.sizes);
        } catch (sizeError) {
          await db.from('products').delete().eq('id', data.id);
          throw sizeError;
        }
        const row = unwrap(await db.from('products').select(PRODUCT_COLUMNS).eq('id', data.id).single());
        return mapProduct(row);
      },

      async update(id, payload) {
        const { error } = await db
          .from('products')
          .update({
            name: payload.name.trim(),
            description: payload.description.trim(),
            brand: payload.brand,
            category: payload.category,
            price: Number(payload.price),
            image_url: payload.imageUrl || '',
            is_featured: Boolean(payload.isFeatured),
            is_active: payload.isActive !== false,
          })
          .eq('id', id);
        if (error) throw new Error('Could not update the product.');
        await writeSizes(id, payload.sizes);
        const row = unwrap(await db.from('products').select(PRODUCT_COLUMNS).eq('id', id).single());
        return mapProduct(row);
      },

      async remove(id) {
        const { error } = await db.from('products').delete().eq('id', id);
        if (error) throw new Error('Could not delete the product.');
      },

      async listAll() {
        const rows = unwrap(
          await db
            .from('products')
            .select(PRODUCT_COLUMNS)
            .order('created_at', { ascending: false })
            .limit(100),
        );
        return (rows || []).map(mapProduct);
      },
    },

    cart: {
      async list(userId) {
        const rows =
          unwrap(
            await db
              .from('cart_items')
              .select(
                'id, product_id, size, quantity, created_at, products ( name, price, image_url, slug, is_active )',
              )
              .eq('user_id', userId)
              .order('created_at', { ascending: true }),
          ) || [];
        const products = rows.map((row) => row.products).filter(Boolean);
        const sizeRows = products.length
          ? unwrap(
              await db
                .from('product_sizes')
                .select('product_id, size, stock')
                .in('product_id', [...new Set(rows.map((row) => row.product_id))]),
            ) || []
          : [];

        return rows.map((row) => {
          const stockRow = sizeRows.find(
            (entry) => entry.product_id === row.product_id && entry.size === row.size,
          );
          return {
            id: row.id,
            product_id: row.product_id,
            size: row.size,
            quantity: row.quantity,
            price: row.products?.price ?? 0,
            name: row.products?.name ?? 'Unavailable product',
            image_url: row.products?.image_url ?? '',
            slug: row.products?.slug ?? '',
            stock: stockRow?.stock ?? 0,
            is_active: Boolean(row.products?.is_active),
          };
        });
      },

      async add(userId, { productId, size, quantity = 1 }) {
        const sizeRow = unwrap(
          await db.from('product_sizes').select('stock').eq('product_id', productId).eq('size', size).maybeSingle(),
        );
        if (!sizeRow) throw new Error('That size is not available for this product.');
        if (sizeRow.stock < 1) throw new Error('That size is out of stock.');

        const existing = unwrap(
          await db
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('size', size)
            .maybeSingle(),
        );
        const nextQuantity = (existing?.quantity || 0) + Number(quantity);
        if (nextQuantity > sizeRow.stock) {
          throw new Error(`Only ${sizeRow.stock} pair(s) left in ${size}.`);
        }

        if (existing) {
          const { error } = await db.from('cart_items').update({ quantity: nextQuantity }).eq('id', existing.id);
          if (error) throw new Error('Could not update your cart.');
        } else {
          const { error } = await db.from('cart_items').insert({
            user_id: userId,
            product_id: productId,
            size,
            quantity: nextQuantity,
          });
          if (error) throw new Error('Could not add this item to your cart.');
        }
      },

      async updateQuantity(userId, itemId, quantity) {
        if (quantity < 1) throw new Error('Quantity must be at least 1.');
        const { error } = await db
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', userId);
        if (error) throw new Error('Could not update the quantity.');
      },

      async remove(userId, itemId) {
        const { error } = await db.from('cart_items').delete().eq('id', itemId).eq('user_id', userId);
        if (error) throw new Error('Could not remove this item.');
      },

      async clear(userId) {
        await db.from('cart_items').delete().eq('user_id', userId);
      },
    },

    orders: {
      async place({ deliveryName, deliveryPhone, deliveryAddress }) {
        const { data, error } = await db.rpc('place_order', {
          p_delivery_name: deliveryName.trim(),
          p_delivery_phone: deliveryPhone.trim(),
          p_delivery_address: deliveryAddress.trim(),
        });
        if (error) throw new Error(error.message || 'Could not place your order.');
        const orderId = Array.isArray(data) ? data[0]?.id : data?.id;
        if (!orderId) throw new Error('Could not place your order.');
        const row = unwrap(
          await db.from('orders').select(ORDER_COLUMNS).eq('id', orderId).single(),
        );
        return mapOrder(row);
      },

      async listMine(userId) {
        const rows = unwrap(
          await db.from('orders').select(ORDER_COLUMNS).eq('user_id', userId).order('created_at', { ascending: false }),
        );
        return (rows || []).map(mapOrder);
      },

      async getById(orderId) {
        const row = unwrap(await db.from('orders').select(ORDER_COLUMNS).eq('id', orderId).maybeSingle());
        if (!row) throw new Error('Order not found.');
        return mapOrder(row);
      },

      async listAll() {
        const rows = unwrap(
          await db
            .from('orders')
            .select(`${ORDER_COLUMNS}, profiles ( full_name )`)
            .order('created_at', { ascending: false })
            .limit(100),
        );
        return (rows || []).map(mapOrder);
      },

      async updateStatus(orderId, status) {
        if (!ORDER_STATUSES.includes(status)) throw new Error('Unknown order status.');
        const { error } = await db.from('orders').update({ status }).eq('id', orderId);
        if (error) throw new Error('Could not update the order status.');
      },
    },

    storage: {
      async uploadProductImage(file) {
        const bucket = client.storage.from('product-images');
        const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const unique =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const path = `products/${unique}.${extension}`;

        const { error } = await bucket.upload(path, file, {
          cacheControl: '3600',
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });
        if (error) throw new Error(error.message || 'Could not upload the image.');

        const { data } = bucket.getPublicUrl(path);
        if (!data?.publicUrl) throw new Error('Could not read the uploaded image URL.');
        return data.publicUrl;
      },
    },
  };
}
