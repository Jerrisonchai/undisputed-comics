/**
 * delivery.js — Delivery & Shipping Info (配送说明)
 * UndisputedComics (金牌漫画) v2.6
 * Pulls shipping rates from admin settings, falls back to defaults
 */
const PageDelivery = {
  _settings: null,

  async init() {
    // Try to load settings from API (Supabase) or localStorage
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        const { data } = await API._client.from('site_settings').select('*').single();
        if (data) this._settings = data;
      }
    } catch {
      // Fallback to localStorage
      this._settings = Storage.get('uc_site_settings');
    }

    // Defaults if nothing configured
    if (!this._settings) {
      this._settings = {
        shipping_west: 8,
        shipping_east: 15,
        free_shipping: 150,
        whatsapp: '+60123456789',
      };
    }
    this._render();
  },

  bindEvents() {},

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const s = this._settings;
    main.innerHTML = `
    <div class="page" id="delivery-page">
      <div class="info-hero">
        <div class="info-hero__icon">🚚</div>
        <h1>配送说明</h1>
        <p>快速 · 可靠 · 全马覆盖</p>
      </div>

      <div class="info-content">
        <section class="info-section">
          <h2>📦 运费标准</h2>
          <div class="info-card-grid">
            <div class="info-card info-card--accent">
              <div class="info-card__label">西马</div>
              <div class="info-card__price">RM ${s.shipping_west || 8}</div>
              <div class="info-card__note">预计 2-3 个工作日</div>
            </div>
            <div class="info-card">
              <div class="info-card__label">东马</div>
              <div class="info-card__price">RM ${s.shipping_east || 15}</div>
              <div class="info-card__note">预计 5-7 个工作日</div>
            </div>
          </div>
          <div class="info-highlight">
            🎉 订单满 <strong>RM ${s.free_shipping || 150}</strong> 即享 <strong>免运费</strong>！
          </div>
        </section>

        <section class="info-section">
          <h2>⏱️ 配送时间</h2>
          <table class="info-table">
            <thead>
              <tr><th>地区</th><th>预计送达</th><th>合作快递</th></tr>
            </thead>
            <tbody>
              <tr><td>巴生谷 (Klang Valley)</td><td>1-2 工作日</td><td>J&T / Ninja Van</td></tr>
              <tr><td>西马其他地区</td><td>2-4 工作日</td><td>J&T / Poslaju</td></tr>
              <tr><td>东马 (Sabah/Sarawak)</td><td>5-7 工作日</td><td>Poslaju</td></tr>
            </tbody>
          </table>
        </section>

        <section class="info-section">
          <h2>📋 订单流程</h2>
          <div class="info-steps">
            <div class="info-step">
              <div class="info-step__num">1</div>
              <div class="info-step__text">
                <strong>下单</strong>
                <p>选择商品 → 加入购物车 → 填写收货信息 → 确认订单</p>
              </div>
            </div>
            <div class="info-step">
              <div class="info-step__num">2</div>
              <div class="info-step__text">
                <strong>WhatsApp 确认</strong>
                <p>通过 WhatsApp 确认订单详情和付款方式</p>
              </div>
            </div>
            <div class="info-step">
              <div class="info-step__num">3</div>
              <div class="info-step__text">
                <strong>付款与发货</strong>
                <p>确认付款后 24 小时内发货，提供追踪号码</p>
              </div>
            </div>
            <div class="info-step">
              <div class="info-step__num">4</div>
              <div class="info-step__text">
                <strong>收货</strong>
                <p>签收包裹，享受您的漫画！有问题随时联系客服</p>
              </div>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h2>❓ 常见问题</h2>
          <div class="info-faq">
            <details class="info-faq__item">
              <summary>可以货到付款吗？</summary>
              <p>目前暂不支持货到付款。我们通过银行转账或 Touch 'n Go eWallet 收款。</p>
            </details>
            <details class="info-faq__item">
              <summary>如何查询包裹状态？</summary>
              <p>发货后我们会通过 WhatsApp 发送追踪号码，您可以在 J&T 或 Poslaju 官网查询。</p>
            </details>
            <details class="info-faq__item">
              <summary>可以到店取货吗？</summary>
              <p>目前我们仅提供配送服务。未来会考虑开设自取点。</p>
            </details>
            <details class="info-faq__item">
              <summary>收到商品有损坏怎么办？</summary>
              <p>请在收到包裹后 24 小时内拍照并通过 WhatsApp 联系我们，我们将为您处理换货或退款。</p>
            </details>
          </div>
        </section>

        <div class="info-cta">
          <button class="btn btn--primary" onclick="AppRouter.navigate('contact')">📧 联系客服</button>
          <button class="btn btn--ghost" onclick="AppRouter.navigate('faq')">💬 更多常见问题</button>
        </div>
      </div>
    </div>`;
  },
};
