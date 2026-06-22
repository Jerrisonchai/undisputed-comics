/**
 * home.js — Homepage Page
 * UndisputedComics (金牌漫画) v1.0
 * Renders: Hero → Categories → Featured → Bestsellers → New → Publishers → Subscribe → Footer
 */

const PageHome = {
  _data: null,
  _categories: null,
  _publishers: null,
  _copy: null,

  /**
   * Initialize and render homepage
   */
  async init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Show skeleton while loading
    main.innerHTML = this._skeletonHTML();

    // Load data
    await this._loadData();

    // Render
    main.innerHTML = this._render();
  },

  /**
   * Load all required JSON data
   */
  async _loadData() {
    const [products, categories, publishers, copy] = await Promise.all([
      Utils.loadJSON('data/products.json'),
      Utils.loadJSON('data/categories.json'),
      Utils.loadJSON('data/publishers.json'),
      Utils.loadJSON('data/copywriting.json'),
    ]);

    this._data = {
      products: products?.products || [],
      categories: categories?.categories || [],
      publishers: publishers?.publishers || [],
      copy: copy || {},
    };

    this._categories = this._data.categories;
    this._publishers = this._data.publishers;
    this._copy = this._data.copy;
  },

  /**
   * Main render
   */
  _render() {
    const featured = this._data.products.filter(p => p.is_featured);
    const newArrivals = this._data.products.filter(p => p.is_new);
    const bestsellers = [...this._data.products].sort(() => 0.5 - Math.random()).slice(0, 6);

    return [
      this._renderHero(),
      this._renderCategories(),
      featured.length ? this._renderFeatured(featured[0]) : '',
      this._renderSection('bestsellers', bestsellers),
      this._renderSection('new_arrivals', newArrivals.length ? newArrivals : this._data.products.slice(0, 6)),
      this._renderPublishers(),
      this._renderSubscribe(),
      this._renderFooter(),
    ].join('');
  },

  /* ═══════════ HERO ═══════════ */
  _renderHero() {
    const tagline = this._copy?.brand?.tagline || '品质漫画，金牌之选';
    const heroUrl = window.AppConfig?.store?.hero_banner_url || '';

    return `
    <section class="hero">
      ${heroUrl ? `<img class="hero__bg" src="${Utils.escapeHTML(heroUrl)}" alt="" loading="eager">` : ''}
      <div class="hero__overlay"></div>
      <div class="hero__content">
        <h1 class="hero__tagline">${Utils.escapeHTML(tagline)}</h1>
        <p class="hero__subtitle">${Utils.escapeHTML(this._copy?.brand?.footer_about?.slice(0, 60) || '为您精选正版中文漫画')}</p>
        <button class="btn btn--primary" onclick="AppRouter.navigate('products')">
          ${Utils.escapeHTML(this._copy?.home?.hero_cta || '立即选购')} →
        </button>
      </div>
    </section>`;
  },

  /* ═══════════ CATEGORIES ═══════════ */
  _renderCategories() {
    const chips = this._categories.map(cat => `
      <button class="chip${cat.id === 'all' ? ' active' : ''}"
              data-category="${cat.id}"
              onclick="AppRouter.navigate('products', {category:'${cat.id}'})">
        <span>${cat.icon}</span>
        <span>${cat.name_zh}</span>
      </button>
    `).join('');

    return `
    <section class="category-section">
      <div class="scroll-x" role="tablist" aria-label="商品分类">
        ${chips}
      </div>
    </section>`;
  },

  /* ═══════════ FEATURED ═══════════ */
  _renderFeatured(product) {
    const pubName = Utils.publisherName(product.publisher, this._publishers);
    const badge = Utils.stockBadge(product.stock_status);
    const coverHTML = product.cover_image?.includes('placeholder')
      ? `<div class="featured-card__image featured-card__image--placeholder">📚</div>`
      : `<img class="featured-card__image" src="${Utils.escapeHTML(product.cover_image)}" alt="${Utils.escapeHTML(product.title_zh)}" loading="lazy">`;

    return `
    <section class="page-section">
      <h2 class="section-header" style="margin-bottom:var(--space-md);font-size:var(--text-xl);font-weight:700;">
        ${Utils.escapeHTML(this._copy?.home?.featured_title || '本周推荐')}
      </h2>
      <div class="featured-card" onclick="AppRouter.navigate('product', {id:'${product.id}'})">
        ${coverHTML}
        <div class="featured-card__body">
          <span class="featured-card__label">⭐ ${Utils.escapeHTML(this._copy?.home?.featured_title || '本周推荐')}</span>
          <h3 class="featured-card__title">${Utils.escapeHTML(product.title_zh)}</h3>
          <span class="featured-card__publisher">${Utils.escapeHTML(pubName)}</span>
          <span class="featured-card__price">${Utils.formatPrice(product.price)}</span>
          <p class="featured-card__desc">${Utils.escapeHTML(product.description_zh || '')}</p>
          <div class="featured-card__actions">
            <span class="badge ${badge.class}">${badge.text}</span>
            <button class="btn btn--primary btn--sm" onclick="event.stopPropagation(); Storage.addToCart(${JSON.stringify({id:product.id,title_zh:product.title_zh,price:product.price,cover_image:product.cover_image,publisher:product.publisher}).replace(/"/g,'&quot;')}); Utils.toast('已加入购物车')">
              🛒 ${Utils.escapeHTML(this._copy?.products?.add_to_cart || '加入购物车')}
            </button>
          </div>
        </div>
      </div>
    </section>`;
  },

  /* ═══════════ PRODUCT SECTION (Bestsellers / New Arrivals) ═══════════ */
  _renderSection(type, products) {
    const title = type === 'bestsellers'
      ? (this._copy?.home?.bestsellers_title || '热销排行')
      : (this._copy?.home?.new_arrivals_title || '最新上架');
    const emoji = type === 'bestsellers' ? '🔥' : '🆕';

    if (!products.length) return '';

    const cards = products.map((p, i) => this._renderProductCard(p, type, i)).join('');

    return `
    <section class="page-section">
      <div class="section-header">
        <h2>${emoji} ${Utils.escapeHTML(title)}</h2>
        <span class="view-all" onclick="AppRouter.navigate('products')">
          ${Utils.escapeHTML(this._copy?.home?.view_all || '查看全部')} →
        </span>
      </div>
      <div class="scroll-x">
        ${cards}
      </div>
    </section>`;
  },

  /* ═══════════ PRODUCT CARD ═══════════ */
  _renderProductCard(product, sectionType, index) {
    const badge = Utils.stockBadge(product.stock_status);
    const pubName = Utils.publisherName(product.publisher, this._publishers);
    const rankBadge = sectionType === 'bestsellers'
      ? `<span style="position:absolute;top:4px;left:4px;background:${index < 3 ? 'var(--gold-primary)' : '#999'};color:white;font-size:12px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:1;">${index + 1}</span>`
      : '';

    const coverHTML = product.cover_image?.includes('placeholder')
      ? `<div class="product-card__image product-card__image--placeholder">📚</div>`
      : `<img class="product-card__image" src="${Utils.escapeHTML(product.cover_image)}" alt="${Utils.escapeHTML(product.title_zh)}" loading="lazy">`;

    return `
    <div class="product-card" onclick="AppRouter.navigate('product', {id:'${product.id}'})" style="position:relative;">
      ${rankBadge}
      ${coverHTML}
      <div class="product-card__body">
        <div class="product-card__badges">
          <span class="badge ${badge.class}">${badge.text}</span>
          ${product.is_new ? `<span class="badge badge--new">${Utils.escapeHTML(this._copy?.badges?.new || '新品')}</span>` : ''}
        </div>
        <h3 class="product-card__title">${Utils.escapeHTML(product.title_zh)}</h3>
        <p class="product-card__publisher">${Utils.escapeHTML(pubName)}</p>
        <span class="product-card__price">
          ${Utils.formatPrice(product.price)}
          ${product.original_price ? `<span class="original">${Utils.formatPrice(product.original_price)}</span>` : ''}
        </span>
      </div>
    </div>`;
  },

  /* ═══════════ PUBLISHERS ═══════════ */
  _renderPublishers() {
    if (!this._publishers.length) return '';

    const cards = this._publishers.map(p => `
      <button class="publisher-card" onclick="AppRouter.navigate('products', {publisher:'${p.id}'})">
        ${Utils.escapeHTML(p.name_zh)}
      </button>
    `).join('');

    return `
    <section class="page-section">
      <h2 class="section-header" style="margin-bottom:var(--space-md);font-size:var(--text-xl);font-weight:700;">
        🏢 ${Utils.escapeHTML(this._copy?.home?.publishers_title || '出版社')}
      </h2>
      <div class="publisher-grid">
        ${cards}
      </div>
    </section>`;
  },

  /* ═══════════ EMAIL SIGNUP ═══════════ */
  _renderSubscribe() {
    return `
    <section class="subscribe-section">
      <h2 class="subscribe-section__title">📧 ${Utils.escapeHTML(this._copy?.home?.subscribe_title || '订阅我们的通讯')}</h2>
      <p class="subscribe-section__desc">${Utils.escapeHTML(this._copy?.home?.subscribe_desc || '')}</p>
      <div class="subscribe-form">
        <input type="email" id="subscribe-email" placeholder="${Utils.escapeHTML(this._copy?.home?.subscribe_placeholder || '输入您的电子邮箱')}">
        <button class="btn btn--primary" id="btn-subscribe">
          ${Utils.escapeHTML(this._copy?.home?.subscribe_btn || '订阅')}
        </button>
      </div>
    </section>`;
  },

  /* ═══════════ FOOTER ═══════════ */
  _renderFooter() {
    const links = [
      { text: '关于我们', route: 'about' },
      { text: '联系我们', route: 'contact' },
      { text: '配送说明', route: 'shipping' },
      { text: '常见问题', route: 'faq' },
    ];

    return `
    <footer class="site-footer">
      <div class="footer-brand">
        <div class="footer-logo">${Utils.escapeHTML(this._copy?.brand?.name_zh || '金牌漫画')}</div>
        <p>${Utils.escapeHTML(this._copy?.brand?.footer_about || '')}</p>
      </div>
      <div class="footer-links">
        ${links.map(l => `<a href="#${l.route}">${Utils.escapeHTML(l.text)}</a>`).join('')}
      </div>
      <div class="footer-bottom">
        ${Utils.escapeHTML(this._copy?.footer?.copyright || '© 2026 金牌漫画 版权所有')}
      </div>
    </footer>`;
  },

  /* ═══════════ SKELETON ═══════════ */
  _skeletonHTML() {
    const skelCards = Array(4).fill(`
      <div class="skeleton skeleton--card">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-line--md"></div>
          <div class="skeleton-line skeleton-line--sm"></div>
          <div class="skeleton-line skeleton-line--sm"></div>
        </div>
      </div>
    `).join('');

    return `
    <!-- Hero skeleton -->
    <section class="hero" style="height:280px;"><div class="hero__overlay"></div></section>

    <!-- Category skeleton -->
    <section class="category-section">
      <div class="scroll-x" style="padding:0 var(--page-padding);">
        ${Array(6).fill('<div class="skeleton" style="width:90px;height:38px;border-radius:24px;flex-shrink:0;"></div>').join('')}
      </div>
    </section>

    <!-- Featured skeleton -->
    <section class="page-section">
      <div class="skeleton" style="width:140px;height:20px;margin-bottom:var(--space-md);"></div>
      <div style="display:flex;gap:var(--space-md);background:var(--bg-white);border-radius:var(--radius-md);padding:var(--space-md);">
        <div class="skeleton" style="width:120px;aspect-ratio:3/4;border-radius:var(--radius-sm);"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:var(--space-sm);">
          <div class="skeleton-line skeleton-line--md"></div>
          <div class="skeleton-line skeleton-line--sm"></div>
          <div class="skeleton-line skeleton-line--sm"></div>
        </div>
      </div>
    </section>

    <!-- Product cards skeleton -->
    <section class="page-section">
      <div class="skeleton" style="width:140px;height:20px;margin-bottom:var(--space-md);"></div>
      <div class="scroll-x">${skelCards}</div>
    </section>
    `;
  },

  /**
   * Bind homepage-specific event listeners (called after render)
   */
  bindEvents() {
    // Subscribe button
    const btn = document.getElementById('btn-subscribe');
    const input = document.getElementById('subscribe-email');
    if (btn && input) {
      btn.addEventListener('click', () => {
        const email = input.value.trim();
        if (!email || !Utils.isValidEmail(email)) {
          Utils.toast('请输入有效的电子邮箱', 'error');
          return;
        }
        // Phase 8: Supabase insert
        Storage.set('subscribe_email', email);
        input.value = '';
        Utils.toast('订阅成功！感谢您的关注。');
      });
    }
  },
};
