/**
 * api.js — Supabase API Layer
 * UndisputedComics (金牌漫画) Phase 5
 * All database operations go through here.
 * Falls back to localStorage when offline or Supabase unavailable.
 */

const API = {
  _client: null,
  _ready: false,

  /**
   * Initialize Supabase client
   */
  init() {
    const { supabaseUrl, supabaseKey } = window.AppConfig;
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[API] No Supabase credentials — running in local-only mode');
      this._ready = false;
      return;
    }
    try {
      this._client = supabase.createClient(supabaseUrl, supabaseKey);
      this._ready = true;
      console.log('[API] Supabase connected');
    } catch (e) {
      console.warn('[API] Supabase init failed:', e.message);
      this._ready = false;
    }
  },

  /** Check if Supabase is available */
  isReady() { return this._ready && !!this._client; },

  // ═══════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════

  /**
   * Normalize product fields (Supabase cover_url → cover_image, etc)
   */
  _normalizeProduct(p) {
    if (!p) return p;
    const out = { ...p };
    // Map cover_url to cover_image for consistent rendering
    if (!out.cover_image && out.cover_url) out.cover_image = out.cover_url;
    if (!out.cover_url && out.cover_image) out.cover_url = out.cover_image;
    return out;
  },

  /**
   * Fetch all active products
   */
  async fetchProducts() {
    if (!this.isReady()) {
      const local = this._localProducts();
      return Array.isArray(local) ? local.map(p => this._normalizeProduct(p)) : (local?.products || []).map(p => this._normalizeProduct(p));
    }
    try {
      const { data, error } = await this._client
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const normalized = (data || []).map(p => this._normalizeProduct(p));
      // Cache locally
      Storage.set('products_cache', normalized, 30 * 60 * 1000);
      return normalized;
    } catch (e) {
      console.warn('[API] fetchProducts failed, using cache:', e.message);
      return Storage.get('products_cache') || this._localProducts();
    }
  },

  /**
   * Fetch single product by ID
   */
  async fetchProduct(id) {
    if (!this.isReady()) return this._normalizeProduct(this._localProduct(id));
    try {
      const { data, error } = await this._client
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return this._normalizeProduct(data);
    } catch (e) {
      console.warn('[API] fetchProduct failed:', e.message);
      return this._localProduct(id);
    }
  },

  // ═══════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════

  /**
   * Create an order
   */
  async createOrder(orderData) {
    const order = {
      user_id: orderData.userId || null,
      status: 'pending',
      customer_name: orderData.name,
      customer_phone: orderData.phone,
      customer_email: orderData.email || null,
      customer_address: orderData.address || null,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping || 0,
      discount: orderData.discount || 0,
      total: orderData.total,
      coupon_code: orderData.couponCode || null,
      notes: orderData.notes || null,
    };

    if (!this.isReady()) {
      // Local fallback
      const local = OrdersModule._createLocal(order);
      return { ...local, items: orderData.items };
    }

    try {
      // Insert order
      const { data, error } = await this._client
        .from('orders')
        .insert(order)
        .select('*')
        .single();
      if (error) throw error;

      // Insert order items
      if (orderData.items && orderData.items.length) {
        const orderItems = orderData.items.map(item => ({
          order_id: data.id,
          product_id: item.id || item.product_id,
          product_title: item.title_zh || item.product_title,
          quantity: item.qty || item.quantity || 1,
          price: item.price,
        }));
        await this._client.from('order_items').insert(orderItems);
      }

      return { ...data, items: orderData.items };
    } catch (e) {
      console.warn('[API] createOrder failed, saving locally:', e.message);
      const local = OrdersModule._createLocal(order);
      return { ...local, items: orderData.items };
    }
  },

  /**
   * Fetch orders for a user
   */
  async fetchUserOrders(userId) {
    if (!this.isReady()) return OrdersModule.getUserHistory(userId);
    try {
      const { data: orders, error } = await this._client
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch items for each order
      for (const order of orders) {
        const { data: items } = await this._client
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        order.items = items || [];
      }
      return orders;
    } catch (e) {
      console.warn('[API] fetchUserOrders failed:', e.message);
      return OrdersModule.getUserHistory(userId);
    }
  },

  // ═══════════════════════════════════════════
  // RATINGS
  // ═══════════════════════════════════════════

  /**
   * Rate a product (upsert — one per user per product)
   */
  async rateProduct(productId, rating) {
    const userId = AuthModule.getUserId?.() || AuthModule.getUser()?.id;
    if (!userId) return { ok: false, error: '请先登录' };

    if (!this.isReady()) return RatingsModule._rateLocal(productId, rating, userId);

    try {
      const { error } = await this._client
        .from('ratings')
        .upsert({ product_id: productId, user_id: userId, rating }, {
          onConflict: 'product_id,user_id'
        });
      if (error) throw error;
      return { ok: true };
    } catch (e) {
      console.warn('[API] rateProduct failed:', e.message);
      return RatingsModule._rateLocal(productId, rating, userId);
    }
  },

  /**
   * Get average rating for a product
   */
  async fetchProductRating(productId) {
    if (!this.isReady()) return RatingsModule._getAvgLocal(productId);
    try {
      const { data, error } = await this._client
        .from('ratings')
        .select('rating')
        .eq('product_id', productId);
      if (error) throw error;
      const count = data.length;
      const average = count ? +(data.reduce((s, r) => s + r.rating, 0) / count).toFixed(1) : 0;
      return { average, count };
    } catch (e) {
      console.warn('[API] fetchProductRating failed:', e.message);
      return RatingsModule._getAvgLocal(productId);
    }
  },

  /**
   * Get user's rating for a product
   */
  async fetchUserRating(productId) {
    const userId = AuthModule.getUserId?.() || AuthModule.getUser()?.id;
    if (!userId) return null;
    if (!this.isReady()) return RatingsModule._getUserRatingLocal(productId, userId);
    try {
      const { data, error } = await this._client
        .from('ratings')
        .select('rating')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data?.rating || null;
    } catch (e) {
      return RatingsModule._getUserRatingLocal(productId, userId);
    }
  },

  /**
   * Get all ratings for a user (for rated products list)
   */
  async fetchUserRatings() {
    const userId = AuthModule.getUserId?.() || AuthModule.getUser()?.id;
    if (!userId) return {};
    if (!this.isReady()) return RatingsModule._getUserRatingsLocal(userId);
    try {
      const { data, error } = await this._client
        .from('ratings')
        .select('product_id, rating')
        .eq('user_id', userId);
      if (error) throw error;
      const map = {};
      data.forEach(r => { map[r.product_id] = r.rating; });
      return map;
    } catch (e) {
      return RatingsModule._getUserRatingsLocal(userId);
    }
  },

  // ═══════════════════════════════════════════
  // FAVORITES
  // ═══════════════════════════════════════════

  /**
   * Toggle favorite for a product
   */
  async toggleFavorite(productId) {
    const userId = AuthModule.getUserId?.() || AuthModule.getUser()?.id;
    if (!userId) return { ok: false, error: '请先登录' };

    if (!this.isReady()) return FavoritesModule._toggleLocal(productId, userId);

    try {
      // Check if already favorited
      const { data: existing } = await this._client
        .from('favorites')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Remove
        await this._client.from('favorites').delete().eq('id', existing.id);
        return { ok: true, favorited: false };
      } else {
        // Add
        await this._client.from('favorites').insert({
          product_id: productId,
          user_id: userId,
        });
        return { ok: true, favorited: true };
      }
    } catch (e) {
      console.warn('[API] toggleFavorite failed:', e.message);
      return FavoritesModule._toggleLocal(productId, userId);
    }
  },

  /**
   * Fetch user's favorite product IDs
   */
  async fetchUserFavorites() {
    const userId = AuthModule.getUserId?.() || AuthModule.getUser()?.id;
    if (!userId) return [];
    if (!this.isReady()) return FavoritesModule._getLocal(userId);
    try {
      const { data, error } = await this._client
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId);
      if (error) throw error;
      return data.map(f => f.product_id);
    } catch (e) {
      console.warn('[API] fetchUserFavorites failed:', e.message);
      return FavoritesModule._getLocal(userId);
    }
  },

  /**
   * Check if a product is favorited
   */
  async checkFavorite(productId) {
    const userId = AuthModule.getUserId?.() || AuthModule.getUser()?.id;
    if (!userId) return false;
    if (!this.isReady()) return FavoritesModule._isLocal(productId, userId);
    try {
      const { data } = await this._client
        .from('favorites')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();
      return !!data;
    } catch (e) {
      return FavoritesModule._isLocal(productId, userId);
    }
  },

  // ═══════════════════════════════════════════
  // AUTH (via Supabase Auth)
  // ═══════════════════════════════════════════

  /**
   * Register a new user
   */
  async signUp(email, password, name) {
    if (!this.isReady()) return AuthModule._registerLocal(email, password, name);
    try {
      const { data, error } = await this._client.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      return {
        ok: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
        },
      };
    } catch (e) {
      console.warn('[API] signUp failed:', e.message);
      return { ok: false, error: e.message };
    }
  },

  /**
   * Login
   */
  async signIn(email, password) {
    if (!this.isReady()) return AuthModule._loginLocal(email, password);
    try {
      const { data, error } = await this._client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Fetch user profile
      const { data: profile } = await this._client
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      return {
        ok: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || profile?.name || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
        },
      };
    } catch (e) {
      console.warn('[API] signIn failed:', e.message);
      return { ok: false, error: e.message };
    }
  },

  /**
   * Logout
   */
  async signOut() {
    if (this.isReady()) {
      try { await this._client.auth.signOut(); } catch (e) { /* ignore */ }
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    const userId = AuthModule.getUserId?.() || AuthModule.getUser()?.id;
    if (!userId) return { ok: false, error: '未登录' };
    if (!this.isReady()) return { ok: true };

    try {
      const { error } = await this._client
        .from('profiles')
        .upsert({
          id: userId,
          name: updates.name,
          phone: updates.phone || null,
          address: updates.address || null,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      return { ok: true };
    } catch (e) {
      console.warn('[API] updateProfile failed:', e.message);
      return { ok: true }; // Silent fail — profile is non-critical
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    if (!this.isReady()) return null;
    try {
      const { data } = await this._client.auth.getSession();
      return data.session;
    } catch (e) {
      return null;
    }
  },

  // ═══════════════════════════════════════════
  // SITE SETTINGS
  // ═══════════════════════════════════════════

  /**
   * Fetch site settings from Supabase
   */
  async fetchSettings() {
    if (!this.isReady()) return null;
    try {
      const { data, error } = await this._client
        .from('site_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('[API] fetchSettings failed:', e.message);
      return null;
    }
  },

  // ═══════════════════════════════════════════
  // LOCAL FALLBACKS (copies of localStorage logic)
  // ═══════════════════════════════════════════

  _localProducts() {
    try {
      const data = Storage.get('products_cache');
      if (data) return data;
    } catch {}
    // Last resort: static JSON
    return [];
  },

  _localProduct(id) {
    const products = this._localProducts();
    return products.find(p => p.id === id) || null;
  },
};

// Auto-init
API.init();
