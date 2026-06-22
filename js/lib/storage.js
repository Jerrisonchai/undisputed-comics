/**
 * storage.js — LocalStorage Wrapper
 * UndisputedComics (金牌漫画) v1.0
 * Prefix: 'uc_' to avoid collision with other apps.
 */

const Storage = {
  _prefix: 'uc_',

  _key(name) {
    return this._prefix + name;
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      if (raw === null) return fallback;
      const data = JSON.parse(raw);
      // Check expiry
      if (data._expires && Date.now() > data._expires) {
        localStorage.removeItem(this._key(key));
        return fallback;
      }
      return data._value !== undefined ? data._value : data;
    } catch {
      return fallback;
    }
  },

  set(key, value, ttlMs = null) {
    try {
      const payload = { _value: value };
      if (ttlMs) payload._expires = Date.now() + ttlMs;
      localStorage.setItem(this._key(key), JSON.stringify(payload));
    } catch (e) {
      console.warn('Storage.set failed:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(this._key(key));
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this._prefix))
      .forEach(k => localStorage.removeItem(k));
  },

  // Cart-specific helpers
  getCart() {
    return this.get('cart', []);
  },

  setCart(items) {
    this.set('cart', items);
    // Fire event for badge updates
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
  },

  addToCart(product, qty = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty = Math.min((existing.qty || 1) + qty, 99);
    } else {
      cart.push({
        id: product.id,
        title_zh: product.title_zh,
        price: product.price,
        cover_image: product.cover_image,
        publisher: product.publisher,
        qty,
      });
    }
    this.setCart(cart);
    return cart;
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.id !== productId);
    this.setCart(cart);
    return cart;
  },

  cartCount() {
    return this.getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
  },

  // Auth
  getSession() {
    return this.get('session', null);
  },

  setSession(session) {
    this.set('session', session);
  },

  clearSession() {
    this.remove('session');
  },
};
