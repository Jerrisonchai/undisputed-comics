/**
 * cart.js — Cart Module
 * UndisputedComics (金牌漫画) v2.0
 * Cart state, mutations, totals. Backed by Storage (localStorage).
 */

const CartModule = {
  /**
   * Get current cart items
   * @returns {Array}
   */
  getItems() {
    return Storage.getCart();
  },

  /**
   * Get cart item count (total quantity)
   * @returns {number}
   */
  count() {
    return Storage.cartCount();
  },

  /**
   * Get unique item count
   * @returns {number}
   */
  uniqueCount() {
    return this.getItems().length;
  },

  /**
   * Add product to cart
   * @param {Object} product - Must have: id, title_zh, price, cover_image, publisher
   * @param {number} qty - Quantity to add
   * @returns {Array} Updated cart
   */
  add(product, qty = 1) {
    return Storage.addToCart(product, qty);
  },

  /**
   * Remove item from cart
   * @param {string} productId
   * @returns {Array}
   */
  remove(productId) {
    return Storage.removeFromCart(productId);
  },

  /**
   * Update item quantity
   * @param {string} productId
   * @param {number} qty - New quantity (1-99)
   * @returns {Array}
   */
  updateQty(productId, qty) {
    qty = Math.max(1, Math.min(99, parseInt(qty) || 1));
    const cart = this.getItems();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.qty = qty;
      Storage.setCart(cart);
    }
    return cart;
  },

  /**
   * Increment item quantity
   * @param {string} productId
   * @returns {number} New quantity
   */
  increment(productId) {
    const cart = this.getItems();
    const item = cart.find(i => i.id === productId);
    if (item && item.qty < 99) {
      item.qty += 1;
      Storage.setCart(cart);
      return item.qty;
    }
    return item ? item.qty : 1;
  },

  /**
   * Decrement item quantity
   * @param {string} productId
   * @returns {number} New quantity
   */
  decrement(productId) {
    const cart = this.getItems();
    const item = cart.find(i => i.id === productId);
    if (item && item.qty > 1) {
      item.qty -= 1;
      Storage.setCart(cart);
      return item.qty;
    }
    return item ? item.qty : 1;
  },

  /**
   * Calculate subtotal
   * @returns {number}
   */
  subtotal() {
    return this.getItems().reduce((sum, item) => {
      return sum + (item.price * (item.qty || 1));
    }, 0);
  },

  /**
   * Calculate shipping cost
   * @param {string} region - 'west' | 'east'
   * @returns {number}
   */
  shipping(region = 'west') {
    const cfg = window.AppConfig?.store || {};
    const subtotal = this.subtotal();
    const freeMin = cfg.shippingFreeMin || 150;
    if (subtotal >= freeMin) return 0;
    return region === 'east' ? (cfg.shippingFlatEast || 15) : (cfg.shippingFlatWest || 8);
  },

  /**
   * Get full order totals
   * @param {string} region
   * @returns {{ subtotal: number, shipping: number, total: number }}
   */
  totals(region = 'west') {
    const subtotal = this.subtotal();
    const shipping = this.shipping(region);
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  },

  /**
   * Clear all items from cart
   */
  clear() {
    Storage.setCart([]);
  },

  /**
   * Check if cart is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.getItems().length === 0;
  },
};
