/**
 * favorites.js — Favorites / Wishlist System
 * UndisputedComics (金牌漫画) v2.3
 * Supabase primary (Phase 5) + localStorage cache/fallback.
 * Favorites: { [userId]: [productId, ...] }
 */

const FavoritesModule = {
  _cache: null,
  _loaded: false,

  _getAll() {
    if (!this._loaded) {
      this._cache = Storage.get('favorites', {});
      this._loaded = true;
    }
    return this._cache;
  },

  _setAll(data) {
    this._cache = data;
    this._loaded = true;
    Storage.set('favorites', data);
  },

  /**
   * Preload favorites from Supabase
   */
  async preload() {
    if (!API.isReady()) return;
    try {
      const { data, error } = await API._client
        .from('favorites')
        .select('product_id, user_id');
      if (error) return;
      const map = {};
      data.forEach(f => {
        if (!map[f.user_id]) map[f.user_id] = [];
        map[f.user_id].push(f.product_id);
      });
      this._setAll(map);
    } catch {}
  },

  /**
   * Toggle favorite for a product
   */
  async toggle(productId) {
    const user = AuthModule.getUser();
    if (!user) return { ok: false, error: '请先登录' };

    if (API.isReady()) {
      const result = await API.toggleFavorite(productId);
      if (result.ok) {
        const all = this._getAll();
        if (!all[user.id]) all[user.id] = [];
        if (result.favorited) {
          if (!all[user.id].includes(productId)) all[user.id].push(productId);
        } else {
          all[user.id] = all[user.id].filter(id => id !== productId);
        }
        this._setAll(all);
        return result;
      }
      return result;
    }

    return this._toggleLocal(productId, user.id);
  },

  /**
   * Check if a product is favorited (sync)
   */
  isFavorited(productId) {
    const user = AuthModule.getUser();
    if (!user) return false;
    const all = this._getAll();
    return (all[user.id] || []).includes(productId);
  },

  /**
   * Get current user's favorite IDs (sync)
   */
  getIds() {
    const user = AuthModule.getUser();
    if (!user) return [];
    const all = this._getAll();
    return all[user.id] || [];
  },

  /**
   * Count favorites (sync)
   */
  count() {
    return this.getIds().length;
  },

  /* ── Local fallback (called by API.js) ── */

  _toggleLocal(productId, userId) {
    const all = this._getAll();
    if (!all[userId]) all[userId] = [];
    const idx = all[userId].indexOf(productId);
    if (idx === -1) {
      all[userId].push(productId);
      this._setAll(all);
      return { ok: true, favorited: true };
    } else {
      all[userId].splice(idx, 1);
      this._setAll(all);
      return { ok: true, favorited: false };
    }
  },

  _getLocal(userId) {
    const all = Storage.get('favorites', {});
    return all[userId] || [];
  },

  _isLocal(productId, userId) {
    const all = Storage.get('favorites', {});
    return (all[userId] || []).includes(productId);
  },
};
