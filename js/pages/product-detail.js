/**
 * product-detail.js — Product Detail Page
 * UndisputedComics (金牌漫画) v2.0
 * Gallery · Info · Quantity · Add to Cart · Buy Now · Related
 */

const PageProductDetail = {
  _product: null,
  _products: [],
  _publishers: [],
  _quantity: 1,

  async init(productId) {
    // Fetch data
    const [prodRes, pubRes] = await Promise.all([
      fetch('data/products.json').then(r => r.json()),
      fetch('data/publishers.json').then(r => r.json()),
    ]);

    this._products = prodRes.products || [];
    this._publishers = pubRes.publishers || [];
    this._product = this._products.find(p => p.id === productId);
    this._quantity = 1;

    if (!this._product) {
      this._renderNotFound(productId);
      return;
    }

    this._render();
  },

  bindEvents() {
    if (!this._product) return;

    // Quantity buttons
    const minusBtn = document.getElementById('pdp-qty-minus');
    const plusBtn = document.getElementById('pdp-qty-plus');
    const qtyVal = document.getElementById('pdp-qty-val');

    if (minusBtn && plusBtn && qtyVal) {
      minusBtn.addEventListener('click', () => {
        if (this._quantity > 1) {
          this._quantity--;
          qtyVal.textContent = this._quantity;
        }
      });

      plusBtn.addEventListener('click', () => {
        if (this._quantity < 99) {
          this._quantity++;
          qtyVal.textContent = this._quantity;
        }
      });
    }

    // Add to Cart
    const addBtn = document.getElementById('pdp-add-cart');
    if (addBtn) {
      addBtn.addEventListener('click', () => this._addToCart());
    }

    // Buy Now (WhatsApp)
    const buyBtn = document.getElementById('pdp-buy-now');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => this._buyNow());
    }

    // Related product clicks
    document.querySelectorAll('#related-products .product-card').forEach(card => {
      card.addEventListener('click', () => {
        AppRouter.navigate('product', { id: card.dataset.productId });
      });
    });

    // Publisher link
    const pubLink = document.getElementById('pdp-publisher-link');
    if (pubLink) {
      pubLink.addEventListener('click', () => {
        AppRouter.navigate('products', { publisher: this._product.publisher });
      });
    }

    // Sticky bar buttons
    const stickyAdd = document.getElementById('pdp-sticky-cart');
    const stickyBuy = document.getElementById('pdp-sticky-buy');
    if (stickyAdd) stickyAdd.addEventListener('click', () => this._addToCart());
    if (stickyBuy) stickyBuy.addEventListener('click', () => this._buyNow());
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const p = this._product;
    const pubName = this._getPublisherName(p.publisher);
    const catName = this._getCategoryName(p.category_id);
    const inStock = p.stock_status === 'in_stock' || p.stock_status === 'limited';
    const canPreorder = p.stock_status === 'pre_order';
    const canBuy = inStock || canPreorder;
    const hasOriginal = p.original_price && p.original_price > p.price;
    const savings = hasOriginal ? p.original_price - p.price : 0;

    main.innerHTML = `
    <div class="page" id="product-detail-page">
      <!-- Gallery -->
      <div class="pdp-gallery">
        <div class="pdp-gallery__placeholder">📚</div>
        ${p.images && p.images.length > 1 ? `
        <div class="pdp-gallery__nav">
          ${p.images.map((_, i) => `<div class="pdp-gallery__dot${i === 0 ? ' active' : ''}"></div>`).join('')}
        </div>` : ''}
      </div>

      <!-- Product Info -->
      <div class="pdp-info">
        <!-- Badges -->
        <div class="pdp-badges">
          ${this._getStockBadgeHtml(p)}
          ${p.is_new ? '<span class="badge badge--new">NEW</span>' : ''}
          ${p.is_featured ? '<span class="badge badge--sale">🔥 热卖</span>' : ''}
        </div>

        <!-- Title -->
        <h1 class="pdp-title">${Utils.escapeHTML(p.title_zh)}</h1>
        ${p.title_en ? `<div class="pdp-title-en">${Utils.escapeHTML(p.title_en)}</div>` : ''}

        <!-- Meta -->
        <div class="pdp-meta">
          ${pubName ? `
          <div class="pdp-meta__item">
            <span class="pdp-meta__label">出版社</span>
            <span class="pdp-meta__value publisher-link" id="pdp-publisher-link">🏢 ${Utils.escapeHTML(pubName)}</span>
          </div>` : ''}
          ${catName ? `
          <div class="pdp-meta__item">
            <span class="pdp-meta__label">分类</span>
            <span class="pdp-meta__value">${Utils.escapeHTML(catName)}</span>
          </div>` : ''}
        </div>

        <!-- Price -->
        <div class="pdp-price-row">
          <span class="pdp-price">RM ${p.price.toFixed(2)}</span>
          ${hasOriginal ? `
          <span class="pdp-price__original">RM ${p.original_price.toFixed(2)}</span>
          <span class="pdp-price__save">省 RM ${savings.toFixed(2)}</span>` : ''}
        </div>

        <!-- Stock Status -->
        <div class="pdp-stock ${p.stock_status}">
          <span class="pdp-stock__dot ${p.stock_status}"></span>
          ${this._getStockText(p)}
        </div>

        <!-- Quantity + Actions -->
        ${canBuy ? `
        <div class="pdp-actions">
          <div class="qty-selector">
            <button id="pdp-qty-minus" ${inStock ? '' : 'disabled'}>−</button>
            <span class="qty-value" id="pdp-qty-val">1</span>
            <button id="pdp-qty-plus" ${inStock ? '' : 'disabled'}>+</button>
          </div>
          <button class="btn btn--primary" id="pdp-add-cart">
            🛒 加入购物车
          </button>
        </div>` : ''}

        <!-- Buy Now -->
        ${canBuy ? `
        <button class="btn btn--outline btn--block pdp-buynow" id="pdp-buy-now">
          💬 立即通过 WhatsApp 购买
        </button>` : `
        <div class="empty-state" style="padding:var(--space-lg) 0;">
          <span style="font-size:40px;">😔</span>
          <p style="margin-top:var(--space-sm);color:var(--text-secondary);">该商品暂时缺货，请稍后再来查看</p>
        </div>`}

        <!-- Description -->
        ${p.description_zh ? `
        <div class="pdp-description">
          <h3 class="pdp-section-title">📖 内容简介</h3>
          <p class="pdp-description__text">${Utils.escapeHTML(p.description_zh)}</p>
        </div>` : ''}
      </div>

      <!-- Related Products -->
      <div class="related-section" id="related-products">
        <div class="section-header">
          <h2>📚 同类推荐</h2>
        </div>
        <div class="scroll-x" id="related-scroll"></div>
      </div>

      <!-- Quick Nav (product detail page bottom) -->
      <div class="pdp-quick-nav">
        <button class="btn btn--glass" onclick="AppRouter.navigate('home')">🏠 首页</button>
        <button class="btn btn--glass" onclick="AppRouter.navigate('products')">📂 分类</button>
        <button class="btn btn--glass" onclick="AppRouter.navigate('cart')">🛒 购物车</button>
        <button class="btn btn--glass" onclick="AppRouter.navigate('account')">👤 我的</button>
      </div>

      <!-- Sticky Add Bar (mobile only) -->
      ${canBuy ? `
      <div class="pdp-sticky-bar">
        <button class="btn btn--primary" id="pdp-sticky-cart">🛒 加入购物车</button>
        <button class="btn btn--outline" id="pdp-sticky-buy">💬 Buy Now</button>
      </div>` : ''}
    </div>`;

    this._renderRelated();
  },

  _renderNotFound(productId) {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = `
    <div class="empty-state page" style="padding-top:var(--space-3xl);">
      <div class="empty-icon">📭</div>
      <h2>商品未找到</h2>
      <p class="empty-text">找不到商品 ID: ${Utils.escapeHTML(productId)}</p>
      <button class="btn btn--primary" onclick="AppRouter.navigate('products')">
        ← 返回商品列表
      </button>
    </div>`;
  },

  _renderRelated() {
    const container = document.getElementById('related-scroll');
    if (!container || !this._product) return;

    // Find related: same category, not same product, up to 6
    const related = this._products
      .filter(p => p.category_id === this._product.category_id && p.id !== this._product.id)
      .slice(0, 6);

    if (!related.length) {
      document.getElementById('related-products').style.display = 'none';
      return;
    }

    container.innerHTML = related.map(p => `
      <div class="product-card" data-product-id="${p.id}" style="width:150px;">
        <div class="product-card__image--placeholder">
          ${(p.title_zh || '📚').charAt(0)}
        </div>
        <div class="product-card__body">
          <div class="product-card__title" style="font-size:var(--text-sm);">${Utils.escapeHTML(p.title_zh)}</div>
          <div class="product-card__price" style="font-size:var(--text-base);">RM ${p.price.toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  },

  _addToCart() {
    if (!this._product) return;

    const cart = Storage.addToCart(this._product, this._quantity);
    Utils.toast(`已加入购物车 (x${this._quantity})`, 'success');

    // Spring animation on cart icon
    const badge = document.getElementById('cart-badge-bottom');
    if (badge) {
      badge.classList.remove('bounce');
      void badge.offsetWidth;
      badge.classList.add('bounce');
    }
  },

  _buyNow() {
    if (!this._product) return;

    // Build WhatsApp checkout message
    const phone = window.AppConfig?.store?.phone || '+60123456789';
    const items = [{
      title_zh: this._product.title_zh,
      price: this._product.price,
      qty: this._quantity,
    }];
    const message = Utils.formatOrderMessage(items, {});
    const waUrl = Utils.whatsappUrl(phone, message);
    window.open(waUrl, '_blank');
  },

  _getStockBadgeHtml(p) {
    switch (p.stock_status) {
      case 'in_stock': return '<span class="badge badge--stock">有货</span>';
      case 'limited': return '<span class="badge badge--limited">限量</span>';
      case 'pre_order': return '<span class="badge badge--preorder">預購</span>';
      default: return '';
    }
  },

  _getStockText(p) {
    switch (p.stock_status) {
      case 'in_stock': return '有现货 · 下单后 1-3 天发货';
      case 'limited': return '限量库存 · 卖完即止';
      case 'pre_order': return '预售商品 · 预计 2-4 周发货';
      case 'out_of_stock': return '暂时缺货';
      default: return '';
    }
  },

  _getPublisherName(pubId) {
    const pub = this._publishers.find(p => p.id === pubId);
    return pub ? pub.name_zh : '';
  },

  _getCategoryName(catId) {
    // Categories might not be loaded — use product data fallback
    const catMap = {
      shonen: '少年漫画',
      shojo: '少女漫画',
      seinen: '青年漫画',
      classics: '经典收藏',
      'new-releases': '熱門新作',
    };
    return catMap[catId] || '';
  },
};
