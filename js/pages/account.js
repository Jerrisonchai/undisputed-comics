/**
 * account.js — Account / Profile Page
 * UndisputedComics (金牌漫画) v2.2
 * Shows user profile, order history, saved info.
 */
const PageAccount = {
  _view: 'menu', // 'menu' | 'orders' | 'profile'

  init() {
    if (!AuthModule.isLoggedIn()) {
      AppRouter.navigate('login');
      return;
    }
    this._view = 'menu';
    this._render();
  },

  bindEvents() {
    // Menu items
    document.getElementById('btn-orders')?.addEventListener('click', () => {
      this._view = 'orders';
      this._renderOrders();
    });

    document.getElementById('btn-favorites')?.addEventListener('click', () => {
      this._view = 'favorites';
      this._renderFavorites();
    });

    document.getElementById('btn-profile')?.addEventListener('click', () => {
      this._view = 'profile';
      this._renderProfile();
    });

    document.getElementById('btn-back-menu')?.addEventListener('click', () => {
      this._view = 'menu';
      this._renderMenu();
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('确定要退出登录吗？')) {
        AuthModule.logout();
      }
    });

    // Profile form
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleProfileSave();
    });
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const user = AuthModule.getUser();
    if (!user) return;

    main.innerHTML = `
    <div class="account-page page">
      <div class="account-header">
        <div class="account-avatar">📚</div>
        <h1 class="account-name">${Utils.escapeHTML(user.name)}</h1>
        <p class="account-email">${Utils.escapeHTML(user.email)}</p>
      </div>
      <div id="account-content"></div>
    </div>`;

    this._renderMenu();
  },

  async _renderMenu() {
    const container = document.getElementById('account-content');
    if (!container) return;

    const orders = await AuthModule.getOrders();
    const orderCount = orders.length;
    const favCount = FavoritesModule.count();

    container.innerHTML = `
    <div class="account-menu">
      <button class="account-menu__item" id="btn-orders">
        <span class="account-menu__icon">📦</span>
        <span>我的订单</span>
        <span style="margin-left:auto;font-size:var(--text-sm);color:var(--text-muted);">${orderCount} 条</span>
      </button>

      <button class="account-menu__item" id="btn-favorites">
        <span class="account-menu__icon">❤️</span>
        <span>我的收藏</span>
        <span style="margin-left:auto;font-size:var(--text-sm);color:var(--text-muted);">${favCount} 本</span>
      </button>

      <button class="account-menu__item" id="btn-profile">
        <span class="account-menu__icon">⚙️</span>
        <span>个人信息</span>
        <span style="margin-left:auto;font-size:var(--text-xs);color:var(--text-muted);">编辑</span>
      </button>

      <button class="account-menu__item account-menu__item--danger" id="btn-logout">
        <span class="account-menu__icon">🚪</span>
        <span>退出登录</span>
      </button>
    </div>`;
  },

  async _renderOrders() {
    const container = document.getElementById('account-content');
    if (!container) return;

    const orders = await AuthModule.getOrders();

    if (orders.length === 0) {
      container.innerHTML = `
      <div class="section-header" style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);">
        <button class="btn btn--icon" id="btn-back-menu" style="font-size:20px;">←</button>
        <h2 style="font-size:var(--text-lg);">我的订单</h2>
      </div>
      <div class="order-empty">
        <div class="order-empty__icon">📭</div>
        <p class="order-empty__text">还没有订单</p>
        <button class="btn btn--primary" onclick="AppRouter.navigate('products')">
          去逛逛
        </button>
      </div>`;
      return;
    }

    // Sort newest first
    const sorted = [...orders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    container.innerHTML = `
    <div class="section-header" style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);">
      <button class="btn btn--icon" id="btn-back-menu" style="font-size:20px;">←</button>
      <h2 style="font-size:var(--text-lg);">我的订单</h2>
      <span style="margin-left:auto;font-size:var(--text-sm);color:var(--text-muted);">${orders.length} 条</span>
    </div>
    <div class="order-list">
      ${sorted.map(o => this._renderOrderCard(o)).join('')}
    </div>`;

    // Re-bind back button
    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this._view = 'menu';
      this._renderMenu();
    });
  },

  _renderOrderCard(order) {
    const statusMap = {
      pending: '待确认',
      confirmed: '已确认',
      shipped: '已发货',
      delivered: '已签收',
    };
    const statusZh = statusMap[order.status] || order.status;
    const date = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('zh-MY', { year:'numeric',month:'long',day:'numeric' })
      : '';
    const itemsText = (order.items || []).slice(0, 2).map(i => i.title_zh).join('、');
    const moreText = (order.items || []).length > 2 ? ` 等${order.items.length}件` : '';

    return `
    <div class="order-card">
      <div class="order-card__header">
        <span class="order-card__id">${Utils.escapeHTML(order.id)}</span>
        <span class="order-card__status order-card__status--${order.status}">${statusZh}</span>
      </div>
      <div class="order-card__items">${Utils.escapeHTML(itemsText + moreText)}</div>
      <div class="order-card__total">RM ${(order.total || 0).toFixed(2)}</div>
      <div class="order-card__date">${date}</div>
    </div>`;
  },

  _renderProfile() {
    const container = document.getElementById('account-content');
    if (!container) return;

    const user = AuthModule.getUser();

    container.innerHTML = `
    <div class="section-header" style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg);">
      <button class="btn btn--icon" id="btn-back-menu" style="font-size:20px;">←</button>
      <h2 style="font-size:var(--text-lg);">个人信息</h2>
    </div>

    <form class="auth-form" id="profile-form" novalidate>
      <div class="form-group">
        <label class="form-group__label" for="prof-name">姓名</label>
        <input class="form-group__input" type="text" id="prof-name"
               value="${Utils.escapeHTML(user.name || '')}" required>
      </div>

      <div class="form-group">
        <label class="form-group__label" for="prof-email">电子邮箱</label>
        <input class="form-group__input" type="email" id="prof-email"
               value="${Utils.escapeHTML(user.email || '')}" disabled
               style="opacity:0.6;">
      </div>

      <div class="form-group">
        <label class="form-group__label" for="prof-phone">电话号码（可选）</label>
        <input class="form-group__input" type="tel" id="prof-phone"
               value="${Utils.escapeHTML(user.phone || '')}"
               placeholder="+6012-3456789">
      </div>

      <div class="form-group">
        <label class="form-group__label" for="prof-address">收货地址（可选）</label>
        <input class="form-group__input" type="text" id="prof-address"
               value="${Utils.escapeHTML(user.address || '')}"
               placeholder="如：吉隆坡 Jalan Ampang">
      </div>

      <button type="submit" class="btn btn--primary">保存更改</button>
    </form>`;

    // Re-bind back button
    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this._view = 'menu';
      this._renderMenu();
    });
  },

  _handleProfileSave() {
    const updates = {
      name: document.getElementById('prof-name').value.trim(),
      phone: document.getElementById('prof-phone').value.trim(),
      address: document.getElementById('prof-address').value.trim(),
    };

    if (!updates.name) {
      alert('请输入姓名');
      return;
    }

    const result = AuthModule.updateProfile(updates);
    if (result.ok) {
      const user = AuthModule.getUser();
      const nameEl = document.querySelector('.account-name');
      if (nameEl) nameEl.textContent = user.name;
      alert('已保存！');
    }
  },

  /**
   * Render favorites / wishlist
   */
  async _renderFavorites() {
    const container = document.getElementById('account-content');
    if (!container) return;

    const favIds = FavoritesModule.getIds();

    container.innerHTML = `
    <div class="section-header" style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);">
      <button class="btn btn--icon" id="btn-back-menu" style="font-size:20px;">←</button>
      <h2 style="font-size:var(--text-lg);">我的收藏 ❤️</h2>
      <span style="margin-left:auto;font-size:var(--text-sm);color:var(--text-muted);">${favIds.length} 本</span>
    </div>`;

    if (favIds.length === 0) {
      container.innerHTML += `
      <div class="order-empty">
        <div class="order-empty__icon">💝</div>
        <p class="order-empty__text">还没有收藏任何漫画</p>
        <button class="btn btn--primary" onclick="AppRouter.navigate('products')">
          去逛逛
        </button>
      </div>`;
    } else {
      // Fetch product data for favorites
      try {
        const res = await fetch('data/products.json');
        const data = await res.json();
        const products = data.products || [];

        const favProducts = favIds.map(id => products.find(p => p.id === id)).filter(Boolean);

        container.innerHTML += `
        <div class="product-listing-grid">
          ${favProducts.map(p => this._renderFavCard(p)).join('')}
        </div>`;

        // Click handlers
        container.querySelectorAll('.product-card').forEach(card => {
          card.addEventListener('click', () => {
            AppRouter.navigate('product', { id: card.dataset.productId });
          });
        });

        // Remove from favorites
        container.querySelectorAll('.btn-fav-remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            FavoritesModule.toggle(btn.dataset.productId);
            this._renderFavorites();
          });
        });
      } catch {
        container.innerHTML += '<p style="text-align:center;color:var(--text-secondary);">加载失败</p>';
      }
    }

    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this._view = 'menu';
      this._renderMenu();
    });
  },

  _renderFavCard(product) {
    const catMap = {
      shonen: '少年漫画', shojo: '少女漫画', seinen: '青年漫画',
      classics: '经典收藏', 'new-releases': '熱門新作',
    };
    const catName = catMap[product.category_id] || '';

    return `
    <div class="product-card" data-product-id="${product.id}" style="position:relative;">
      <div class="product-card__image--placeholder">${catName.charAt(0) || '📚'}</div>
      <div class="product-card__body">
        <div class="product-card__title">${Utils.escapeHTML(product.title_zh)}</div>
        ${this._renderCardRating(product.id)}
        <div class="product-card__price">RM ${product.price.toFixed(2)}</div>
        <button class="btn-fav-remove" data-product-id="${product.id}"
                style="position:absolute;top:4px;right:4px;background:none;border:none;font-size:18px;cursor:pointer;padding:4px;">
          ❌
        </button>
      </div>
    </div>`;
  },

  /**
   * Render small star rating for a product card
   */
  _renderCardRating(productId) {
    const { average, count } = RatingsModule.getAverage(productId);
    if (!count) return '';
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.round(average) ? '★' : '☆');
    }
    return `<div class="product-card__rating"><span class="card-stars">${stars.join('')}</span><span class="card-rating-count">${average}</span></div>`;
  },
};
