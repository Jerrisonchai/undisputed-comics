/**
 * favorites.js — Favorites / Wishlist Module
 * UndisputedComics (金牌漫画) v2.2
 * Logged-in users can add/remove books from favorites.
 * Stored per-user in localStorage: uc_favorites → { [userId]: [productId, ...] }
 */
const FavoritesModule = {
  /**
   * Get all favorites data
   * @returns {Object} { [userId]: string[] }
   */
  _getAll() {
    return Storage.get('favorites', {});
  },

  _setAll(data) {
    Storage.set('favorites', data);
  },

  /**
   * Get current user's favorite product IDs
   * @returns {string[]}
   */
  getIds() {
    const user = AuthModule.getUser();
    if (!user) return [];
    const all = this._getAll();
    return all[user.id] || [];
  },

  /**
   * Check if a product is favorited
   * @param {string} productId
   * @returns {boolean}
   */
  isFavorited(productId) {
    return this.getIds().includes(productId);
  },

  /**
   * Toggle favorite for a product
   * @param {string} productId
   * @returns {{ ok: boolean, favorited: boolean, error?: string }}
   */
  toggle(productId) {
    const user = AuthModule.getUser();
    if (!user) return { ok: false, favorited: false, error: '请先登录' };
    if (!productId) return { ok: false, favorited: false, error: '商品ID无效' };

    const all = this._getAll();
    if (!all[user.id]) all[user.id] = [];

    const idx = all[user.id].indexOf(productId);
    if (idx >= 0) {
      all[user.id].splice(idx, 1);
      this._setAll(all);
      return { ok: true, favorited: false };
    } else {
      all[user.id].push(productId);
      this._setAll(all);
      return { ok: true, favorited: true };
    }
  },

  /**
   * Get count of favorites for current user
   * @returns {number}
   */
  count() {
    return this.getIds().length;
  },
};
