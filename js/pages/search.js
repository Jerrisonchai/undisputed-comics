/**
 * search.js — Search Results Page
 * UndisputedComics (金牌漫画) v2.0
 * Search bar + filtered results grid
 */

const PageSearch = {
  _products: [],
  _categories: [],
  _publishers: [],
  _query: '',

  async init(query) {
    this._query = query || '';

    // Fetch data
    const [prodRes, catRes, pubRes] = await Promise.all([
      fetch('data/products.json').then(r => r.json()),
      fetch('data/categories.json').then(r => r.json()),
      fetch('data/publishers.json').then(r => r.json()),
    ]);

    this._products = prodRes.products || [];
    this._categories = catRes.categories || [];
    this._publishers = pubRes.publishers || [];

    this._render();
  },

  bindEvents() {
    const input = document.getElementById('search-page-input');
    const btn = document.getElementById('search-page-btn');

    if (!input || !btn) return;

    const doSearch = () => {
      const q = input.value.trim();
      if (q) {
        AppRouter.navigate('search', { q });
      }
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    // Product card clicks
    document.querySelectorAll('#search-results-grid .product-card').forEach(card => {
      card.addEventListener('click', () => {
        AppRouter.navigate('product', { id: card.dataset.productId });
      });
    });
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Filter products
    const q = this._query.toLowerCase();
    const results = q ? this._products.filter(p =>
      p.title_zh.toLowerCase().includes(q) ||
      p.title_en.toLowerCase().includes(q) ||
      this._getCategoryName(p.category_id).toLowerCase().includes(q) ||
      this._getPublisherName(p.publisher).toLowerCase().includes(q)
    ) : [];

    main.innerHTML = `
    <div class="page" id="search-page">
      <!-- Search Bar -->
      <div class="search-bar">
        <input type="search"
               class="search-bar__input"
               id="search-page-input"
               placeholder="搜索漫画..."
               value="${Utils.escapeHTML(this._query)}"
               autocomplete="off">
        <button class="search-bar__btn" id="search-page-btn" aria-label="搜索">🔍</button>
      </div>

      <!-- Results Header -->
      ${this._query ? `
      <div class="search-results-header">
        <p class="search-results-header__query">
          搜索：<em>"${Utils.escapeHTML(this._query)}"</em>
        </p>
        <p class="search-results-header__count">
          找到 ${results.length} 件相关商品
        </p>
      </div>` : `
      <div class="empty-state" style="padding-top:var(--space-2xl);">
        <div class="empty-icon">🔍</div>
        <p class="empty-text">输入关键词搜索漫画</p>
      </div>`}

      <!-- Results Grid -->
      ${this._query ? `
      <div class="product-listing-grid" id="search-results-grid">
        ${results.length ? results.map(p => this._renderCard(p)).join('') : `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">📭</div>
          <p class="empty-text">没有找到匹配的商品</p>
          <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-md);">
            试试其他关键词或浏览全部商品
          </p>
          <button class="btn btn--primary" onclick="AppRouter.navigate('products')">
            📚 浏览全部商品
          </button>
        </div>`}
      </div>` : ''}
    </div>`;
  },

  _renderCard(product) {
    const pubName = this._getPublisherName(product.publisher);
    const hasOriginal = product.original_price && product.original_price > product.price;

    return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card__image--placeholder">
        ${product.title_zh ? product.title_zh.charAt(0) : '📚'}
      </div>
      <div class="product-card__body">
        <div class="product-card__badges">
          ${this._getStockBadge(product)}
          ${product.is_new ? '<span class="badge badge--new">NEW</span>' : ''}
        </div>
        <div class="product-card__title">${Utils.escapeHTML(product.title_zh)}</div>
        <div class="product-card__publisher">${Utils.escapeHTML(pubName)}</div>
        <div class="product-card__price">
          RM ${product.price.toFixed(2)}
          ${hasOriginal ? `<span class="original">RM ${product.original_price.toFixed(2)}</span>` : ''}
        </div>
      </div>
    </div>`;
  },

  _getStockBadge(p) {
    switch (p.stock_status) {
      case 'in_stock': return '<span class="badge badge--stock">有货</span>';
      case 'limited': return '<span class="badge badge--limited">限量</span>';
      case 'pre_order': return '<span class="badge badge--preorder">預購</span>';
      default: return '';
    }
  },

  _getPublisherName(pubId) {
    const pub = this._publishers.find(p => p.id === pubId);
    return pub ? pub.name_zh : '';
  },

  _getCategoryName(catId) {
    const cat = this._categories.find(c => c.id === catId);
    return cat ? cat.name_zh : '';
  },
};
