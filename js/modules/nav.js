/**
 * nav.js — Navigation Module
 * UndisputedComics (金牌漫画) v1.0
 * Handles top bar, bottom tab bar, cart badge updates.
 */

const Nav = {
  _tabs: [
    { id: 'home',   icon: '🏠', label: '首页' },
    { id: 'products', icon: '📂', label: '分类' },
    { id: 'cart',   icon: '🛒', label: '购物车' },
    { id: 'account', icon: '👤', label: '我的' },
  ],

  /**
   * Initialize navigation bars in the DOM
   */
  init() {
    this._renderTopNav();
    this._renderBottomNav();
    this._updateCartBadge();

    // Listen for cart changes
    window.addEventListener('cart-updated', () => this._updateCartBadge());
  },

  /**
   * Render top navigation bar
   */
  _renderTopNav() {
    const topNav = document.getElementById('top-nav');
    if (!topNav) return;

    const logo = window.AppConfig?.store?.logo_url
      ? `<img src="${Utils.escapeHTML(window.AppConfig.store.logo_url)}" alt="金牌漫画">`
      : '金牌漫画';

    topNav.innerHTML = `
      <span class="nav-logo">${logo}</span>
      <span class="nav-spacer"></span>
      <button class="nav-icon" id="btn-search" aria-label="搜索">🔍</button>
      <button class="nav-icon" id="btn-cart-top" aria-label="购物车">
        🛒
        <span class="cart-badge" id="cart-badge-top"></span>
      </button>
    `;

    document.getElementById('btn-search').addEventListener('click', () => {
      window.AppRouter?.navigate('search');
    });

    document.getElementById('btn-cart-top').addEventListener('click', () => {
      window.AppRouter?.navigate('cart');
    });
  },

  /**
   * Render bottom tab bar
   */
  _renderBottomNav() {
    const bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav) return;

    bottomNav.innerHTML = this._tabs.map(tab => `
      <button class="tab-btn" data-route="${tab.id}" aria-label="${tab.label}">
        <span class="tab-icon-wrap">${tab.icon}</span>
        <span>${tab.label}</span>
        ${tab.id === 'cart' ? '<span class="cart-badge" id="cart-badge-bottom"></span>' : ''}
      </button>
    `).join('');

    bottomNav.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        window.AppRouter?.navigate(route);
      });
    });
  },

  /**
   * Highlight the active tab
   * @param {string} route
   */
  setActive(route) {
    const bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav) return;

    bottomNav.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.dataset.route === route ||
        (route === 'product' && btn.dataset.route === 'products') ||
        (route === 'checkout' && btn.dataset.route === 'cart');
      btn.classList.toggle('active', isActive);
    });
  },

  /**
   * Update cart badge count (public alias)
   */
  updateCartBadge() {
    this._updateCartBadge();
  },

  /**
   * Update cart badge count
   */
  _updateCartBadge() {
    const count = Storage.cartCount();
    const badges = document.querySelectorAll('#cart-badge-top, #cart-badge-bottom');

    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 300);
      } else {
        badge.textContent = '';
      }
    });
  },

  /**
   * Show/hide bottom nav (e.g., hide on checkout page)
   * @param {boolean} visible
   */
  toggleBottomNav(visible) {
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = visible ? 'flex' : 'none';
  },
};
