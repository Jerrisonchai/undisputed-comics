/**
 * ratings.js — Book Rating System
 * UndisputedComics (金牌漫画) v2.3
 * Supabase primary (Phase 5) + localStorage cache/fallback.
 * Ratings: { [productId]: { [userId]: rating } }
 */

const RatingsModule = {
  _cache: null,
  _loaded: false,

  _getAll() {
    if (!this._loaded) {
      this._cache = Storage.get('ratings', {});
      this._loaded = true;
    }
    return this._cache;
  },

  _setAll(data) {
    this._cache = data;
    this._loaded = true;
    Storage.set('ratings', data);
  },

  /**
   * Preload ratings from Supabase
   */
  async preload() {
    if (!API.isReady()) return;
    try {
      const { data, error } = await API._client
        .from('ratings')
        .select('product_id, user_id, rating');
      if (error) return;
      const map = {};
      data.forEach(r => {
        if (!map[r.product_id]) map[r.product_id] = {};
        map[r.product_id][r.user_id] = r.rating;
      });
      this._setAll(map);
    } catch {}
  },

  /**
   * Rate a product
   */
  async rate(productId, rating) {
    const user = AuthModule.getUser();
    if (!user) return { ok: false, error: '请先登录' };
    if (!productId) return { ok: false, error: '商品ID无效' };
    if (rating < 1 || rating > 5) return { ok: false, error: '评分必须在1-5之间' };

    // Try Supabase
    if (API.isReady()) {
      const result = await API.rateProduct(productId, rating);
      if (result.ok) {
        // Update local cache
        const all = this._getAll();
        if (!all[productId]) all[productId] = {};
        all[productId][user.id] = rating;
        this._setAll(all);
        return { ok: true };
      }
      return result;
    }

    // Local fallback
    return this._rateLocal(productId, rating, user.id);
  },

  /**
   * Get current user's rating for a product (sync)
   */
  getUserRating(productId) {
    const user = AuthModule.getUser();
    if (!user) return null;
    const all = this._getAll();
    return all[productId]?.[user.id] ?? null;
  },

  /**
   * Get average rating for a product (sync)
   */
  getAverage(productId) {
    const all = this._getAll();
    const ratings = all[productId] ? Object.values(all[productId]) : [];
    if (!ratings.length) return { average: 0, count: 0 };
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return { average: Math.round(avg * 10) / 10, count: ratings.length };
  },

  /**
   * Get all products rated by current user
   */
  getUserRatedProducts() {
    const user = AuthModule.getUser();
    if (!user) return [];
    const all = this._getAll();
    const results = [];
    for (const [productId, ratings] of Object.entries(all)) {
      if (ratings[user.id] !== undefined) {
        results.push({ productId, rating: ratings[user.id] });
      }
    }
    return results;
  },

  /* ── Local fallback (called by API.js) ── */

  _rateLocal(productId, rating, userId) {
    const all = this._getAll();
    if (!all[productId]) all[productId] = {};
    all[productId][userId] = rating;
    this._setAll(all);
    return { ok: true };
  },

  _getAvgLocal(productId) {
    return this.getAverage(productId);
  },

  _getUserRatingLocal(productId, userId) {
    const all = Storage.get('ratings', {});
    return all[productId]?.[userId] ?? null;
  },

  _getUserRatingsLocal(userId) {
    const all = Storage.get('ratings', {});
    const map = {};
    for (const [pid, ratings] of Object.entries(all)) {
      if (ratings[userId] !== undefined) map[pid] = ratings[userId];
    }
    return map;
  },
};
