/**
 * ratings.js — Book Rating System
 * UndisputedComics (金牌漫画) v2.2
 * Logged-in users can rate each book once. Guests see averages only.
 * Stored in localStorage: uc_ratings → { [productId]: { [userId]: rating } }
 */
const RatingsModule = {
  /**
   * Get all ratings data
   * @returns {Object}
   */
  _getAll() {
    return Storage.get('ratings', {});
  },

  _setAll(data) {
    Storage.set('ratings', data);
  },

  /**
   * Rate a product (login required)
   * @param {string} productId
   * @param {number} rating - 1-5
   * @returns {{ ok: boolean, error?: string }}
   */
  rate(productId, rating) {
    const user = AuthModule.getUser();
    if (!user) return { ok: false, error: '请先登录' };
    if (!productId) return { ok: false, error: '商品ID无效' };
    if (rating < 1 || rating > 5) return { ok: false, error: '评分必须在1-5之间' };

    const all = this._getAll();
    if (!all[productId]) all[productId] = {};
    all[productId][user.id] = rating;
    this._setAll(all);
    return { ok: true };
  },

  /**
   * Get current user's rating for a product
   * @param {string} productId
   * @returns {number|null} 1-5 or null if not rated
   */
  getUserRating(productId) {
    const user = AuthModule.getUser();
    if (!user) return null;
    const all = this._getAll();
    return all[productId]?.[user.id] ?? null;
  },

  /**
   * Get average rating for a product
   * @param {string} productId
   * @returns {{ average: number, count: number }}
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
   * @returns {Array<{productId: string, rating: number}>}
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
};
