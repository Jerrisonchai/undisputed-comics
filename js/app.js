/**
 * app.js — Application Shell + Hash Router
 * UndisputedComics (金牌漫画) v2.0
 * Initializes app, handles routing, page transitions.
 */

const AppRouter = {
  _currentRoute: null,
  _currentParams: {},

  /**
   * Initialize the app
   */
  init() {
    Nav.init();

    // Parse initial hash or default to home
    this._handleRoute();

    // Listen for hash changes
    window.addEventListener('hashchange', () => this._handleRoute());
  },

  /**
   * Navigate to a route
   * @param {string} route - e.g., 'home', 'products', 'product', 'cart'
   * @param {Object} params - Query params, e.g., { id: '123', category: 'shonen' }
   */
  navigate(route, params = {}) {
    let hash = '#' + route;

    if (route === 'product' && params.id) {
      hash = '#product/' + params.id;
    } else if (route === 'products') {
      const parts = [];
      if (params.category && params.category !== 'all') parts.push('category=' + encodeURIComponent(params.category));
      if (params.publisher) parts.push('publisher=' + encodeURIComponent(params.publisher));
      if (parts.length) hash = '#products?' + parts.join('&');
    } else if (route === 'search') {
      const parts = [];
      if (params.q) parts.push('q=' + encodeURIComponent(params.q));
      if (parts.length) hash = '#search?' + parts.join('&');
    } else if (route === 'publisher' && params.name) {
      hash = '#publisher/' + encodeURIComponent(params.name);
    }

    window.location.hash = hash;
  },

  /**
   * Handle current hash route
   */
  _handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [baseQuery, ...rest] = hash.split('?');
    const parts = baseQuery.split('/');
    const route = parts[0] || 'home';

    // Parse query params
    const params = {};
    if (rest.length) {
      rest.join('?').split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    // Parse path params (e.g., #product/123, #publisher/tongli)
    if (parts.length > 1) {
      if (route === 'product') params.id = parts[1];
      if (route === 'publisher') params.name = parts[1];
    }

    this._currentRoute = route;
    this._currentParams = params;

    // Update nav active state
    Nav.setActive(route);

    // Show/hide bottom nav (hide on product detail, checkout, login)
    const hideNavOn = ['checkout', 'login', 'product'];
    Nav.toggleBottomNav(!hideNavOn.includes(route));

    // Render the appropriate page
    this._renderPage(route, params);
  },

  /**
   * Render page based on route
   */
  async _renderPage(route, params) {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Scroll to top
    window.scrollTo(0, 0);

    switch (route) {
      case 'home':
        await PageHome.init();
        PageHome.bindEvents();
        break;

      case 'products':
        await PageProducts.init(params.category, params.publisher);
        PageProducts.bindEvents();
        break;

      case 'product':
        await PageProductDetail.init(params.id);
        PageProductDetail.bindEvents();
        break;

      case 'search':
        await PageSearch.init(params.q);
        PageSearch.bindEvents();
        break;

      case 'publisher':
        // Route publisher to products page with publisher filter
        await PageProducts.init(null, params.name);
        PageProducts.bindEvents();
        break;

      case 'cart':
        main.innerHTML = this._placeholderPage('🛒', '购物车', '购物车功能将在 Phase 3 上线');
        break;

      case 'checkout':
        main.innerHTML = this._placeholderPage('📋', '结算', '结算功能将在 Phase 3 上线');
        break;

      case 'login':
        main.innerHTML = this._placeholderPage('👤', '登录', '会员系统将在 Phase 4 上线');
        break;

      case 'account':
        main.innerHTML = this._placeholderPage('👤', '我的账户', '账户功能将在 Phase 4 上线');
        break;

      default:
        main.innerHTML = this._placeholderPage('📭', '页面未找到', '请检查网址是否正确');
    }
  },

  /**
   * Placeholder page for not-yet-implemented routes
   */
  _placeholderPage(emoji, title, subtitle) {
    return `
    <div class="empty-state page" style="padding-top:var(--space-2xl);">
      <div class="empty-icon">${emoji}</div>
      <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-sm);">${Utils.escapeHTML(title)}</h2>
      <p class="empty-text" style="font-size:var(--text-base);">
        ${Utils.escapeHTML(subtitle)}
      </p>
      <button class="btn btn--primary" onclick="AppRouter.navigate('home')">
        ← 返回首页
      </button>
    </div>`;
  },
};

/**
 * App entry point — fires on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  AppRouter.init();
});
