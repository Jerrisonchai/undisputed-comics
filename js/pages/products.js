/**
 * products.js — Product Listing Page
 * UndisputedComics (金牌漫画) v2.0
 * Category filter chips · Sort · Publisher filter · Product grid
 */

const PageProducts = {
  _products: [],
  _categories: [],
  _publishers: [],
  _activeCategory: 'all',
  _activePublisher: null,
  _sort: 'featured',
  _searchQuery: '',

  async init(category, publisher, search) {
    this._activeCategory = category || 'all';
    this._activePublisher = publisher || null;
    this._searchQuery = search || '';

    // Fetch both data sources in parallel
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
    // Category chip clicks
    document.querySelectorAll('#product-filters .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const catId = chip.dataset.category;
        this._activeCategory = catId;
        this._activePublisher = null;
        this._renderFilters();
        this._renderGrid();
        this._scrollToGrid();
      });
    });

    // Sort change
    const sortEl = document.getElementById('sort-select');
    if (sortEl) {
      sortEl.addEventListener('change', () => {
        this._sort = sortEl.value;
        this._renderGrid();
      });
    }

    // Publisher filter clicks in publisher section
    document.querySelectorAll('[data-filter-publisher]').forEach(el => {
      el.addEventListener('click', () => {
        this._activePublisher = el.dataset.filterPublisher;
        this._activeCategory = 'all';
        AppRouter.navigate('products', { publisher: this._activePublisher });
      });
    });
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
    <div class="page" id="products-page">
      <!-- Search Bar -->
      <div class="search-bar" id="product-search-bar">
        <input type="search"
               class="search-bar__input"
               id="product-search-input"
               placeholder="搜索漫画..."
               value="${Utils.escapeHTML(this._searchQuery)}"
               autocomplete="off">
        <button class="search-bar__btn" id="product-search-btn" aria-label="搜索">🔍</button>
      </div>
      <div id="search-suggestions"></div>

      <!-- Category Filter Chips -->
      <div class="filter-row scroll-x" id="product-filters"></div>

      <!-- Sort Bar -->
      <div class="sort-bar">
        <span class="sort-bar__count" id="result-count"></span>
        <select class="sort-bar__select" id="sort-select">
          <option value="featured">🔥 精选推荐</option>
          <option value="newest">🆕 最新上架</option>
          <option value="price-asc">💰 价格从低到高</option>
          <option value="price-desc">💎 价格从高到低</option>
          <option value="popular">⭐ 最受欢迎</option>
        </select>
      </div>

      <!-- Product Grid -->
      <div class="product-listing-grid" id="product-grid"></div>
    </div>`;

    this._renderFilters();
    this._renderGrid();
    this._setupSearch();
  },

  _renderFilters() {
    const container = document.getElementById('product-filters');
    if (!container) return;

    // "All" chip
    let html = `<button class="chip${this._activeCategory === 'all' && !this._activePublisher ? ' active' : ''}"
                      data-category="all">
      <span class="chip-icon">📚</span><span>全部</span>
    </button>`;

    this._categories.forEach(cat => {
      html += `<button class="chip${this._activeCategory === cat.id ? ' active' : ''}"
                    data-category="${cat.id}">
        <span class="chip-icon">${cat.icon}</span><span>${cat.name_zh}</span>
      </button>`;
    });

    // Publisher filter chips
    if (this._publishers.length) {
      html += '<span style="width:8px;flex-shrink:0"></span>';
      this._publishers.forEach(pub => {
        html += `<button class="chip${this._activePublisher === pub.id ? ' active' : ''}"
                      data-filter-publisher="${pub.id}">
          <span class="chip-icon">🏢</span><span>${pub.name_zh}</span>
        </button>`;
      });
    }

    container.innerHTML = html;
  },

  _getFilteredProducts() {
    let items = [...this._products];

    // Category filter
    if (this._activeCategory && this._activeCategory !== 'all') {
      items = items.filter(p => p.category_id === this._activeCategory);
    }

    // Publisher filter
    if (this._activePublisher) {
      items = items.filter(p => p.publisher === this._activePublisher);
    }

    // Search filter
    if (this._searchQuery) {
      const q = this._searchQuery.toLowerCase();
      items = items.filter(p =>
        p.title_zh.toLowerCase().includes(q) ||
        p.title_en.toLowerCase().includes(q) ||
        p.publisher.toLowerCase().includes(q) ||
        (this._getCategoryName(p.category_id) || '').toLowerCase().includes(q)
      );
    }

    // Sort
    items = this._sortProducts(items);

    return items;
  },

  _sortProducts(items) {
    switch (this._sort) {
      case 'newest':
        return items.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0) || b.sort_order - a.sort_order);
      case 'price-asc':
        return items.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return items.sort((a, b) => b.price - a.price);
      case 'popular':
        return items.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.sort_order - b.sort_order);
      default: // featured
        return items.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.sort_order - b.sort_order);
    }
  },

  _renderGrid() {
    const grid = document.getElementById('product-grid');
    const count = document.getElementById('result-count');
    if (!grid) return;

    const items = this._getFilteredProducts();

    if (count) {
      count.textContent = `共 ${items.length} 件商品`;
    }

    if (items.length === 0) {
      grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">📭</div>
        <p class="empty-text">没有找到相关商品</p>
        <button class="btn btn--primary" onclick="AppRouter.navigate('products')">
          查看全部商品
        </button>
      </div>`;
      return;
    }

    grid.innerHTML = items.map(p => this._renderCard(p)).join('');

    // Click handlers on cards
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.productId;
        AppRouter.navigate('product', { id });
      });
    });
  },

  _renderCard(product) {
    const stockBadge = this._getStockBadge(product);
    const catName = this._getCategoryName(product.category_id);
    const pubName = this._getPublisherName(product.publisher);
    const hasOriginal = product.original_price && product.original_price > product.price;

    return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card__image--placeholder">
        ${catName ? catName.charAt(0) : '📚'}
      </div>
      <div class="product-card__body">
        <div class="product-card__badges">
          ${stockBadge}
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

  _getStockBadge(product) {
    switch (product.stock_status) {
      case 'in_stock':
        return '<span class="badge badge--stock">有货</span>';
      case 'limited':
        return '<span class="badge badge--limited">限量</span>';
      case 'pre_order':
        return '<span class="badge badge--preorder">預購</span>';
      case 'out_of_stock':
        return '<span class="badge badge--soldout">售罄</span>';
      default:
        return '';
    }
  },

  _getCategoryName(catId) {
    const cat = this._categories.find(c => c.id === catId);
    return cat ? cat.name_zh : '';
  },

  _getPublisherName(pubId) {
    const pub = this._publishers.find(p => p.id === pubId);
    return pub ? pub.name_zh : '';
  },

  _scrollToGrid() {
    const grid = document.getElementById('product-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  _setupSearch() {
    const input = document.getElementById('product-search-input');
    const btn = document.getElementById('product-search-btn');
    const suggestions = document.getElementById('search-suggestions');

    if (!input || !btn) return;

    const doSearch = () => {
      const q = input.value.trim();
      AppRouter.navigate('search', { q });
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    // Autocomplete suggestions
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 1) {
        if (suggestions) suggestions.innerHTML = '';
        return;
      }
      debounceTimer = setTimeout(() => this._showSuggestions(q, suggestions), 200);
    });

    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
      if (suggestions && !input.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.innerHTML = '';
      }
    });
  },

  _showSuggestions(query, container) {
    if (!container) return;
    const q = query.toLowerCase();
    const matches = this._products.filter(p =>
      p.title_zh.toLowerCase().includes(q) ||
      p.title_en.toLowerCase().includes(q)
    ).slice(0, 5);

    if (!matches.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
    <div class="search-suggestions">
      ${matches.map(p => `
        <div class="search-suggestions__item" data-product-id="${p.id}">
          <span class="match-icon">📚</span>
          <span>${Utils.escapeHTML(p.title_zh)}</span>
          <span style="margin-left:auto;color:var(--primary);font-weight:700;font-size:var(--text-sm);">RM ${p.price.toFixed(2)}</span>
        </div>
      `).join('')}
    </div>`;

    // Click suggestion → go to product
    container.querySelectorAll('.search-suggestions__item').forEach(item => {
      item.addEventListener('click', () => {
        AppRouter.navigate('product', { id: item.dataset.productId });
        container.innerHTML = '';
      });
    });
  }
};
