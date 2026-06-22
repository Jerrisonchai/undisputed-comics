/**
 * utils.js — Utility Functions
 * UndisputedComics (金牌漫画) v1.0
 */

const Utils = {
  /**
   * Format price in Malaysian Ringgit
   * @param {number} price
   * @returns {string} e.g. "RM 28.00"
   */
  formatPrice(price) {
    if (price == null || isNaN(price)) return 'RM 0.00';
    return 'RM ' + Number(price).toFixed(2);
  },

  /**
   * Format date in Chinese locale
   * @param {string|Date} date
   * @returns {string} e.g. "2026年6月22日"
   */
  formatDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  },

  /**
   * Get stock badge config
   * @param {string} status - 'in_stock' | 'pre_order' | 'limited' | 'sold_out'
   * @returns {{ class: string, text: string }}
   */
  stockBadge(status) {
    const map = {
      in_stock:   { class: 'badge--stock',    text: '现货' },
      pre_order:  { class: 'badge--preorder', text: '預購' },
      limited:    { class: 'badge--limited',  text: '限量' },
      sold_out:   { class: 'badge--soldout',  text: '售完' },
    };
    return map[status] || { class: 'badge--stock', text: '现货' };
  },

  /**
   * Get publisher name from slug
   * @param {string} slug
   * @param {Array} publishers
   * @returns {string}
   */
  publisherName(slug, publishers = []) {
    const p = publishers.find(p => p.id === slug || p.slug === slug);
    return p ? p.name_zh : slug;
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text
   * @param {number} maxLen
   * @returns {string}
   */
  truncate(text, maxLen = 60) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
  },

  /**
   * Generate WhatsApp checkout URL
   * @param {string} phone - Admin WhatsApp number
   * @param {string} message - Pre-formatted order message
   * @returns {string}
   */
  whatsappUrl(phone, message) {
    const clean = phone.replace(/[^0-9+]/g, '');
    return 'https://wa.me/' + clean + '?text=' + encodeURIComponent(message);
  },

  /**
   * Format order message for WhatsApp
   * @param {Array} items - Cart items
   * @param {Object} order - Order details
   * @returns {string}
   */
  formatOrderMessage(items, order = {}) {
    const cfg = window.AppConfig?.store || {};
    const lines = [
      '\uD83D\uDED2 *' + (cfg.name_zh || '金牌漫画') + ' 订单*',
      '────────────────',
      '商品：',
    ];

    items.forEach(item => {
      lines.push(
        (item.qty > 1 ? item.qty + '. ' : '') +
        '《' + item.title_zh + '》' +
        (item.qty > 1 ? ' ×' + item.qty : '') +
        '  ' + this.formatPrice(item.price * (item.qty || 1))
      );
    });

    lines.push('────────────────');

    const subtotal = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    lines.push('小计：' + this.formatPrice(subtotal));

    if (order.discount > 0) {
      lines.push('优惠：' + this.formatPrice(-order.discount));
    }

    if (order.pointsRedeemed > 0) {
      lines.push('积分抵扣：' + this.formatPrice(-order.pointsRedeemed / (window.AppConfig?.store?.pointsRedeemRate || 100)));
    }

    const total = order.total || subtotal;
    lines.push('总计：*' + this.formatPrice(total) + '*');
    lines.push('────────────────');
    lines.push('姓名：' + (order.name || ''));
    lines.push('电话：' + (order.phone || ''));
    if (order.email) lines.push('电邮：' + order.email);
    if (order.notes) lines.push('备注：' + order.notes);

    return lines.join('\n');
  },

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate Malaysian phone number
   * @param {string} phone
   * @returns {boolean}
   */
  isValidPhone(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    return digits.length >= 9 && digits.length <= 12;
  },

  /**
   * Debounce function
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Show toast notification
   * @param {string} message
   * @param {'success'|'error'} type
   */
  toast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' toast--error' : ' toast--success');
    el.textContent = message;
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, 2500);
  },

  /**
   * Load JSON file
   * @param {string} path
   * @returns {Promise<Object>}
   */
  async loadJSON(path) {
    try {
      const res = await fetch(path + '?v=' + (window.AppConfig?.version || '1'));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      console.warn('Failed to load:', path, err);
      return null;
    }
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} str
   * @returns {string}
   */
  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};
