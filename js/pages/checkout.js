/**
 * checkout.js — Checkout Page (3-Step Flow)
 * UndisputedComics (金牌漫画) v2.0
 * Step 1: Contact Info → Step 2: Order Review → Step 3: Confirm via WhatsApp
 */

const PageCheckout = {
  _step: 1,
  _customer: { name: '', phone: '', email: '', notes: '' },

  /**
   * Initialize checkout page
   */
  async init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // If cart is empty, redirect
    if (CartModule.isEmpty()) {
      AppRouter.navigate('cart');
      return;
    }

    this._step = 1;

    // Pre-fill customer info if logged in
    const user = AuthModule.isLoggedIn() ? AuthModule.getUser() : null;
    this._customer = {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      notes: '',
    };

    main.innerHTML = this._render();
  },

  /**
   * Bind checkout events
   */
  bindEvents() {
    if (this._step === 1) this._bindStep1();
    if (this._step === 2) this._bindStep2();
    if (this._step === 3) this._bindStep3();
  },

  /**
   * Render current step
   */
  _render() {
    const stepHTML = this._step === 1 ? this._renderStep1()
                   : this._step === 2 ? this._renderStep2()
                   : this._renderStep3();

    return `
    <div class="checkout-page">
      <div class="checkout-header">
        <button class="btn btn--glass" id="btn-checkout-back" style="padding:var(--space-sm);min-width:auto;">
          ← 返回
        </button>
        <h2 style="font-size:var(--text-2xl);font-weight:800;margin-left:var(--space-md);">结算</h2>
      </div>

      ${this._renderSteps()}

      ${stepHTML}
    </div>`;
  },

  /**
   * Re-render current step (for same-page transitions, since hashchange doesn't fire when hash stays '#checkout')
   */
  _reRender() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = this._render();
    this.bindEvents();
  },

  /**
   * Step indicator
   */
  _renderSteps() {
    const steps = [
      { num: 1, label: '联系信息' },
      { num: 2, label: '确认订单' },
      { num: 3, label: '完成' },
    ];

    return `
    <div class="checkout-steps">
      ${steps.map((s, i) => `
        ${i > 0 ? `<span class="checkout-step-line${this._step > s.num ? ' done' : ''}"></span>` : ''}
        <div class="checkout-step${this._step === s.num ? ' active' : ''}${this._step > s.num ? ' done' : ''}">
          <span class="step-dot">${this._step > s.num ? '✓' : s.num}</span>
        </div>
      `).join('')}
    </div>`;
  },

  /* ═══════════ STEP 1: Contact Info ═══════════ */
  _renderStep1() {
    const c = this._customer;
    return `
    <div class="checkout-section">
      <h3><span class="section-icon">📋</span> 联系信息</h3>
      <form id="checkout-form" autocomplete="on" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label" for="cust-name">姓名 <span class="required">*</span></label>
          <input type="text" id="cust-name" class="form-input" placeholder="请输入您的姓名"
                 value="${Utils.escapeHTML(c.name)}" required autocomplete="name">
          <span class="form-error" id="err-name">请输入姓名</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="cust-phone">电话 <span class="required">*</span></label>
          <input type="tel" id="cust-phone" class="form-input" placeholder="例如：012-3456789"
                 value="${Utils.escapeHTML(c.phone)}" required autocomplete="tel">
          <span class="form-error" id="err-phone">请输入有效的电话号码 (9-12位数字)</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="cust-email">电邮 <span style="color:var(--text-disabled);">(选填)</span></label>
          <input type="email" id="cust-email" class="form-input" placeholder="example@email.com"
                 value="${Utils.escapeHTML(c.email)}" autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label" for="cust-notes">备注 <span style="color:var(--text-disabled);">(选填)</span></label>
          <textarea id="cust-notes" class="form-input form-input--textarea"
                    placeholder="如有特殊要求，请在此注明…">${Utils.escapeHTML(c.notes)}</textarea>
        </div>
      </form>
    </div>

    <div class="checkout-actions">
      <button class="btn btn--outline" id="btn-back-to-cart">← 返回购物车</button>
      <button class="btn btn--primary" id="btn-step1-next">下一步 →</button>
    </div>`;
  },

  _bindStep1() {
    // Checkout header back button → return to cart
    document.getElementById('btn-checkout-back')?.addEventListener('click', () => {
      AppRouter.navigate('cart');
    });

    document.getElementById('btn-back-to-cart')?.addEventListener('click', () => {
      AppRouter.navigate('cart');
    });

    document.getElementById('btn-step1-next')?.addEventListener('click', () => {
      if (this._validateStep1()) {
        this._saveStep1();
        this._step = 2;
        this._reRender();
      }
    });
  },

  _validateStep1() {
    let valid = true;
    const name = document.getElementById('cust-name');
    const phone = document.getElementById('cust-phone');

    // Validate name
    const errName = document.getElementById('err-name');
    if (!name.value.trim()) {
      name.classList.add('error');
      errName?.classList.add('visible');
      valid = false;
    } else {
      name.classList.remove('error');
      errName?.classList.remove('visible');
    }

    // Validate phone
    const errPhone = document.getElementById('err-phone');
    if (!Utils.isValidPhone(phone.value)) {
      phone.classList.add('error');
      errPhone?.classList.add('visible');
      valid = false;
    } else {
      phone.classList.remove('error');
      errPhone?.classList.remove('visible');
    }

    return valid;
  },

  _saveStep1() {
    this._customer.name = document.getElementById('cust-name').value.trim();
    this._customer.phone = document.getElementById('cust-phone').value.trim();
    this._customer.email = document.getElementById('cust-email').value.trim();
    this._customer.notes = document.getElementById('cust-notes').value.trim();
  },

  /* ═══════════ STEP 2: Order Review ═══════════ */
  _renderStep2() {
    const items = CartModule.getItems();
    const totals = CartModule.totals();
    const c = this._customer;

    const itemsHTML = items.map(item => `
      <li class="order-summary__item">
        <div class="order-summary__image">
          <img src="${Utils.escapeHTML(item.cover_image || 'assets/images/placeholder/comic-cover.png')}"
               alt="${Utils.escapeHTML(item.title_zh)}" loading="lazy">
        </div>
        <div class="order-summary__info">
          <div class="order-summary__title">${Utils.escapeHTML(item.title_zh)}</div>
          <div class="order-summary__meta">${Utils.formatPrice(item.price)} × ${item.qty || 1}</div>
        </div>
        <div class="order-summary__price">${Utils.formatPrice(item.price * (item.qty || 1))}</div>
      </li>
    `).join('');

    return `
    <div class="checkout-section">
      <h3><span class="section-icon">📦</span> 订单详情</h3>
      <ul class="order-summary">${itemsHTML}</ul>

      <div class="price-breakdown">
        <div class="price-breakdown__row">
          <span>小计</span>
          <span class="value">${Utils.formatPrice(totals.subtotal)}</span>
        </div>
        <div class="price-breakdown__row">
          <span>运费${totals.shipping === 0 ? ' (免邮)' : ' (西马)'}</span>
          <span class="value">${totals.shipping === 0 ? '免费 🎉' : Utils.formatPrice(totals.shipping)}</span>
        </div>
        <div class="price-breakdown__row total">
          <span>总计</span>
          <span class="value">${Utils.formatPrice(totals.total)}</span>
        </div>
      </div>
    </div>

    <div class="checkout-section">
      <h3><span class="section-icon">👤</span> 收货信息</h3>
      <div style="display:flex;flex-direction:column;gap:var(--space-sm);font-size:var(--text-base);">
        <div><strong>姓名：</strong>${Utils.escapeHTML(c.name)}</div>
        <div><strong>电话：</strong>${Utils.escapeHTML(c.phone)}</div>
        ${c.email ? `<div><strong>电邮：</strong>${Utils.escapeHTML(c.email)}</div>` : ''}
        ${c.notes ? `<div><strong>备注：</strong>${Utils.escapeHTML(c.notes)}</div>` : ''}
      </div>
    </div>

    <div class="checkout-actions">
      <button class="btn btn--outline" id="btn-step2-back">← 修改信息</button>
      <button class="btn btn--primary" id="btn-step2-confirm">确认订单 →</button>
    </div>`;
  },

  _bindStep2() {
    // Checkout header back button → return to Step 1
    document.getElementById('btn-checkout-back')?.addEventListener('click', () => {
      this._step = 1;
      this._reRender();
    });

    document.getElementById('btn-step2-back')?.addEventListener('click', () => {
      this._step = 1;
      this._reRender();
    });

    document.getElementById('btn-step2-confirm')?.addEventListener('click', () => {
      this._step = 3;
      try {
        this._order = OrdersModule.create(this._customer, 'west', AuthModule.getUser()?.id || null);
        CartModule.clear();
        Nav.updateCartBadge();
      } catch (err) {
        Utils.toast('创建订单失败，请重试', 'error');
        console.error('Order creation failed:', err);
        this._step = 2;
      }
      this._reRender();
    });
  },

  /* ═══════════ STEP 3: Confirmation ═══════════ */
  _renderStep3() {
    if (!this._order) {
      AppRouter.navigate('cart');
      return '';
    }

    const o = this._order;
    const itemsCount = o.items.reduce((s, i) => s + i.qty, 0);

    return `
    <div class="order-confirmation">
      <div class="confirmation-icon">✅</div>
      <h2>订单已生成！</h2>
      <p>请通过 WhatsApp 发送订单确认<br>我们的客服将尽快回复您</p>

      <div class="confirmation-details">
        <div class="detail-row">
          <span>订单编号</span>
          <span style="font-weight:600;">${o.id}</span>
        </div>
        <div class="detail-row">
          <span>商品数量</span>
          <span>${itemsCount} 件</span>
        </div>
        <div class="detail-row">
          <span>下单时间</span>
          <span>${Utils.formatDate(o.created_at)}</span>
        </div>
        <div class="detail-row">
          <span>订单状态</span>
          <span class="badge badge--stock">待确认</span>
        </div>
        <div class="detail-row">
          <span>总计</span>
          <span>${Utils.formatPrice(o.total)}</span>
        </div>
      </div>

      <button class="btn btn--whatsapp" id="btn-whatsapp-send" style="width:100%;height:56px;font-size:var(--text-lg);margin-bottom:var(--space-md);">
        💬 通过 WhatsApp 发送订单
      </button>

      <button class="btn btn--outline" id="btn-back-to-shop" style="width:100%;">
        ← 继续购物
      </button>
    </div>`;
  },

  _bindStep3() {
    if (!this._order) return;

    document.getElementById('btn-whatsapp-send')?.addEventListener('click', () => {
      const url = OrdersModule.getWhatsAppUrl(this._order);
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    document.getElementById('btn-back-to-shop')?.addEventListener('click', () => {
      AppRouter.navigate('home');
    });

    // Checkout header back button — go home (order already placed)
    document.getElementById('btn-checkout-back')?.addEventListener('click', () => {
      AppRouter.navigate('home');
    });
  },
};
