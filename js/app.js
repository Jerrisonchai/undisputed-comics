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
  async init() {
    ThemeToggle.init();

    // Init Supabase + restore session
    await AuthModule.init();

    // Preload ratings & favorites from Supabase
    await Promise.all([
      RatingsModule.preload(),
      FavoritesModule.preload(),
    ]);

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
    const hideNavOn = ['checkout', 'login', 'register', 'product', 'about', 'delivery', 'contact', 'faq'];
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
        await PageCart.init();
        PageCart.bindEvents();
        break;

      case 'checkout':
        await PageCheckout.init();
        PageCheckout.bindEvents();
        break;

      case 'login':
        PageLogin.init();
        PageLogin.bindEvents();
        break;

      case 'register':
        PageRegister.init();
        PageRegister.bindEvents();
        break;

      case 'account':
        PageAccount.init();
        PageAccount.bindEvents();
        break;

      case 'about':
        await PageAbout.init();
        PageAbout.bindEvents();
        break;

      case 'delivery':
        await PageDelivery.init();
        PageDelivery.bindEvents();
        break;

      case 'contact':
        await PageContact.init();
        PageContact.bindEvents();
        break;

      case 'faq':
        await PageFAQ.init();
        PageFAQ.bindEvents();
        break;

      default:
        main.innerHTML = this._placeholderPage('📭', '页面未找到', '请检查网址是否正确');
    }

    // Update SEO metadata
    this._updateSEO(route, params);
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

  /**
   * Update SEO metadata per page
   */
  _updateSEO(route, params) {
    const titles = {
      home: '金牌漫画 · 品质漫画，金牌之选',
      products: '全部漫画 · 金牌漫画',
      product: '商品详情 · 金牌漫画',
      cart: '购物车 · 金牌漫画',
      checkout: '结算 · 金牌漫画',
      login: '登录 · 金牌漫画',
      register: '注册 · 金牌漫画',
      account: '我的账户 · 金牌漫画',
      search: '搜索 · 金牌漫画',
      about: '关于我们 · 金牌漫画',
      delivery: '配送说明 · 金牌漫画',
      contact: '联系我们 · 金牌漫画',
      faq: '常见问题 · 金牌漫画',
    };

    const descriptions = {
      home: '品质漫画，金牌之选。正版中文漫画在线书店，全马配送。',
      products: '浏览全部正版中文漫画。海贼王、咒术迴战、鬼灭之刃等热门漫画在线购买。',
      product: '正版中文漫画详情。查看价格、库存、评价，立即下单。',
      cart: '查看购物车，准备好结算您的漫画订单。',
      checkout: '填写收货信息，完成订单。全马配送，满RM150免运费。',
      login: '登录金牌漫画账户，查看订单历史和收藏清单。',
      register: '注册金牌漫画账户，享受收藏、评价和会员功能。',
      account: '管理您的金牌漫画账户，查看订单、收藏和评价。',
      search: '搜索金牌漫画书店的正版中文漫画。',
      about: '了解金牌漫画的品牌故事和使命。品质漫画，金牌之选。',
      delivery: '配送说明与运费标准。全马配送，满RM150免运费。',
      contact: '联系金牌漫画客服。WhatsApp、电子邮件多种方式联系我们。',
      faq: '常见问题解答。AI客服助手为您解答漫画购买、配送、付款等问题。',
    };

    document.title = titles[route] || titles.home;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', descriptions[route] || descriptions.home);

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', titles[route] || titles.home);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', descriptions[route] || descriptions.home);
  },
};

/**
 * App entry point — fires on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  AppRouter.init();
});
