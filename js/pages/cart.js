/**
 * cart.js — Cart Page
 * UndisputedComics (金牌漫画) v2.0
 * Renders cart items, quantity controls, order summary.
 */

const PageCart = {
  /**
   * Initialize cart page
   */
  async init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const items = CartModule.getItems();

    if (!items.length) {
      main.innerHTML = this._emptyCart();
      return;
    }

    const totals = CartModule.totals();
    main.innerHTML = this._render(items, totals);
  },

  /**
   * Bind cart page events
   */
  bindEvents() {
    const items = CartModule.getItems();
    if (!items.length) {
      this._bindEmptyEvents();
      return;
    }
    this._bindItemEvents();
  },

  /**
   * Render cart with items
   */
  _render(items, totals) {
    const count = items.reduce((s, i) => s + (i.qty || 1), 0);
    const uniqueCount = items.length;

    const itemsHTML = items.map((item, idx) => `
      <div class="cart-item${idx === items.length - 1 ? ' item-new' : ''}" data-id="${Utils.escapeHTML(item.id)}">
        <div class="cart-item__image">
          <img src="${Utils.escapeHTML(item.cover_image || 'assets/images/placeholder/comic-cover.png')}"
               alt="${Utils.escapeHTML(item.title_zh)}"
               loading="lazy">
        </div>
        <div class="cart-item__info">
          <div class="cart-item__title">${Utils.escapeHTML(item.title_zh)}</div>
          <div class="cart-item__bottom">
            <div class="cart-item__price">${Utils.formatPrice(item.price * (item.qty || 1))}</div>
            <div class="qty-selector">
              <button class="qty-btn" data-action="decrement" data-id="${Utils.escapeHTML(item.id)}" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
              <span class="qty-value">${item.qty || 1}</span>
              <button class="qty-btn" data-action="increment" data-id="${Utils.escapeHTML(item.id)}" ${item.qty >= 99 ? 'disabled' : ''}>+</button>
            </div>
          </div>
        </div>
        <button class="cart-item__remove" data-action="remove" data-id="${Utils.escapeHTML(item.id)}" aria-label="删除">✕</button>
      </div>
    `).join('');

    return `
    <div class="cart-page">
      <div class="cart-header">
        <h2>🛒 购物车</h2>
        <span class="cart-count">${count} 件商品 (${uniqueCount} 种)</span>
      </div>

      <div class="cart-items" id="cart-items">
        ${itemsHTML}
      </div>

      <div class="cart-footer">
        <div class="cart-footer__summary">
          <span class="cart-footer__label">合计 (${count} 件)</span>
          <span class="cart-footer__total">${Utils.formatPrice(totals.total)}</span>
          ${totals.shipping > 0
            ? `<span style="font-size:var(--text-xs);color:var(--text-secondary);">含运费 ${Utils.formatPrice(totals.shipping)} · 满RM${window.AppConfig?.store?.shippingFreeMin || 150}免邮</span>`
            : `<span class="badge badge--stock" style="margin-top:2px;">🎉 免运费</span>`
          }
        </div>
        <button class="btn btn--primary" id="btn-checkout">
          去结算 →
        </button>
      </div>
    </div>`;
  },

  /**
   * Empty cart state
   */
  _emptyCart() {
    return `
    <div class="empty-state page">
      <div class="empty-icon">🛒</div>
      <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-sm);">购物车是空的</h2>
      <p class="empty-text">去逛逛，找到你的下一本珍藏吧！</p>
      <button class="btn btn--primary" onclick="AppRouter.navigate('products')">
        📚 浏览漫画
      </button>
    </div>`;
  },

  /**
   * Bind item quantity + remove events
   */
  _bindItemEvents() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    cartItems.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const productId = btn.dataset.id;

      if (action === 'increment') {
        CartModule.increment(productId);
        this.refresh();
      } else if (action === 'decrement') {
        CartModule.decrement(productId);
        this.refresh();
      } else if (action === 'remove') {
        this._removeItem(productId);
      }
    });

    // Checkout button
    const checkoutBtn = document.getElementById('btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        AppRouter.navigate('checkout');
      });
    }
  },

  /**
   * Bind empty cart events
   */
  _bindEmptyEvents() {
    // Browse button uses inline onclick
  },

  /**
   * Animate item removal then refresh
   */
  _removeItem(productId) {
    const itemEl = document.querySelector(`.cart-item[data-id="${productId}"]`);
    if (itemEl) {
      itemEl.classList.add('removing');
      itemEl.addEventListener('transitionend', () => {
        CartModule.remove(productId);
        this.refresh();
      }, { once: true });
      // Fallback if transitionend doesn't fire
      setTimeout(() => {
        if (itemEl.parentNode) {
          CartModule.remove(productId);
          this.refresh();
        }
      }, 400);
    } else {
      CartModule.remove(productId);
      this.refresh();
    }
  },

  /**
   * Refresh the cart page (re-render)
   */
  refresh() {
    AppRouter._handleRoute();
  },
};
