/**
 * delivery.js — Delivery & Shipping Info (配送说明)
 * UndisputedComics (金牌漫画) v2.8 — Copywriting Polish
 */
const PageDelivery = {
  _settings: null,

  async init() {
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        const { data } = await API._client.from('site_settings').select('*').single();
        if (data) this._settings = data;
      }
    } catch {
      this._settings = Storage.get('uc_site_settings');
    }

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
        <p>快速 · 安全 · 全马送到家 🏠</p>
      </div>

      <div class="info-content">
        <section class="info-section">
          <h2>📦 运费多少？</h2>
          <div class="info-card-grid">
            <div class="info-card info-card--accent">
              <div class="info-card__label">🇲🇾 西马</div>
              <div class="info-card__price">RM ${s.shipping_west || 8}</div>
              <div class="info-card__note">预计 2-3 个工作日</div>
            </div>
            <div class="info-card">
              <div class="info-card__label">🇲🇾 东马</div>
              <div class="info-card__price">RM ${s.shipping_east || 15}</div>
              <div class="info-card__note">预计 5-7 个工作日</div>
            </div>
          </div>
          <div class="info-highlight">
            🎉 订单满 <strong>RM ${s.free_shipping || 150}</strong> 即享 <strong>免运费</strong>！买多省多！
          </div>
        </section>

        <section class="info-section">
          <h2>⏱️ 多久能收到？</h2>
          <table class="info-table">
            <thead>
              <tr><th>地区</th><th>预计送达</th><th>合作快递</th></tr>
            </thead>
            <tbody>
              <tr><td>🏙️ 巴生谷 (Klang Valley)</td><td>1-2 个工作日</td><td>J&T / Ninja Van</td></tr>
              <tr><td>🌴 西马其他地区</td><td>2-4 个工作日</td><td>J&T / Poslaju</td></tr>
              <tr><td>🏝️ 东马 (Sabah/Sarawak)</td><td>5-7 个工作日</td><td>Poslaju</td></tr>
            </tbody>
          </table>
          <p style="margin-top:12px;font-size:15px;color:var(--text-disabled);">⏰ 工作日下单，当天处理。周末及公共假期顺延至下一个工作日。</p>
        </section>

        <section class="info-section">
          <h2>📋 下单流程</h2>
          <div class="info-steps">
            <div class="info-step">
              <div class="info-step__num">1</div>
              <div class="info-step__text">
                <strong>挑选漫画加入购物车 🛒</strong>
                <p>浏览我们的目录，把心仪的漫画加入购物车，填写收货地址和联系方式。</p>
              </div>
            </div>
            <div class="info-step">
              <div class="info-step__num">2</div>
              <div class="info-step__text">
                <strong>WhatsApp 确认订单 💬</strong>
                <p>提交订单后，我们的客服会通过 WhatsApp 联系你确认详情和付款方式。</p>
              </div>
            </div>
            <div class="info-step">
              <div class="info-step__num">3</div>
              <div class="info-step__text">
                <strong>付款后 24 小时内发货 📦</strong>
                <p>确认付款后马上打包发货！你会在 WhatsApp 收到包裹追踪号码。</p>
              </div>
            </div>
            <div class="info-step">
              <div class="info-step__num">4</div>
              <div class="info-step__text">
                <strong>开心收货！📬</strong>
                <p>签收包裹，泡杯茶，享受你的漫画时光～有问题随时 WhatsApp 我们！</p>
              </div>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h2>❓ 配送常见问题</h2>
          <div class="info-faq">
            <details class="info-faq__item">
              <summary>可以货到付款（COD）吗？</summary>
              <p>目前暂不支持货到付款。我们通过银行转账（Maybank / CIMB / Public Bank）或 Touch 'n Go eWallet 收款，安全方便！</p>
            </details>
            <details class="info-faq__item">
              <summary>如何查询包裹到哪里了？</summary>
              <p>发货后我们会通过 WhatsApp 发送追踪号码（Tracking Number）。你可以在 J&T Express 或 Poslaju 官网随时查询包裹状态。</p>
            </details>
            <details class="info-faq__item">
              <summary>可以自己去店里取货吗？</summary>
              <p>目前我们是纯线上书店，仅提供配送服务。未来如果有开实体店，一定第一时间通知大家！🏪</p>
            </details>
            <details class="info-faq__item">
              <summary>收到书有损坏怎么办？</summary>
              <p>虽然我们包装得很用心，但万一运输途中出问题——请在收到包裹 24 小时内拍照 WhatsApp 我们，我们会马上处理换货或退款。你的满意是我们的责任！💪</p>
            </details>
          </div>
        </section>

        <div class="info-cta">
          <button class="btn btn--primary" onclick="AppRouter.navigate('contact')">📧 还有疑问？联系客服</button>
          <button class="btn btn--ghost" onclick="AppRouter.navigate('faq')">💬 查看更多 FAQ</button>
        </div>
      </div>
    </div>`;
  },
};
