/**
 * contact.js — Contact Us (联系我们)
 * UndisputedComics (金牌漫画) v2.8 — Copywriting Polish
 */
const PageContact = {
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
        whatsapp: '+60123456789',
        email: 'hello@undisputedcomics.com',
        store_name: '金牌漫画',
        store_tagline: '品质漫画，金牌之选',
      };
    }
    this._render();
  },

  bindEvents() {
    document.getElementById('copy-whatsapp')?.addEventListener('click', () => {
      const phone = this._settings.whatsapp.replace(/\D/g, '');
      navigator.clipboard?.writeText(phone).then(() => {
        Utils.toast('📋 WhatsApp 号码已复制！', 'success');
      }).catch(() => {
        const el = document.getElementById('contact-phone');
        if (el) {
          const range = document.createRange();
          range.selectNode(el);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
          Utils.toast('📋 请长按手动复制', 'info');
        }
      });
    });
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const s = this._settings;
    const waNumber = (s.whatsapp || '').replace(/\D/g, '');
    const waLink = `https://wa.me/${waNumber}`;
    const emailLink = `mailto:${s.email || ''}`;

    main.innerHTML = `
    <div class="page" id="contact-page">
      <div class="info-hero">
        <div class="info-hero__icon">📬</div>
        <h1>联系我们</h1>
        <p>有问题？想聊漫画？随时找我们！😊</p>
      </div>

      <div class="info-content">
        <div class="contact-methods">
          <a href="${waLink}" target="_blank" rel="noopener" class="contact-card contact-card--whatsapp">
            <div class="contact-card__icon">💬</div>
            <div class="contact-card__body">
              <h3>WhatsApp 即时聊天</h3>
              <p id="contact-phone">${s.whatsapp}</p>
              <span class="contact-card__action">打开 WhatsApp →</span>
            </div>
          </a>

          <a href="${emailLink}" class="contact-card contact-card--email">
            <div class="contact-card__icon">📧</div>
            <div class="contact-card__body">
              <h3>电子邮件</h3>
              <p>${s.email}</p>
              <span class="contact-card__action">发送邮件 →</span>
            </div>
          </a>
        </div>

        <div class="contact-actions">
          <button class="btn btn--outline" id="copy-whatsapp">📋 复制 WhatsApp 号码</button>
        </div>

        <section class="info-section">
          <h2>⏰ 客服营业时间</h2>
          <div class="info-card-grid info-card-grid--3">
            <div class="info-card">
              <div class="info-card__label">周一至周五</div>
              <div class="info-card__value">9:00 AM - 9:00 PM</div>
              <div class="info-card__note">正常营业 🟢</div>
            </div>
            <div class="info-card">
              <div class="info-card__label">周六</div>
              <div class="info-card__value">10:00 AM - 6:00 PM</div>
              <div class="info-card__note">半天营业 🟡</div>
            </div>
            <div class="info-card">
              <div class="info-card__label">周日及公假</div>
              <div class="info-card__value">休息日</div>
              <div class="info-card__note">留言会尽快回复 🔴</div>
            </div>
          </div>
          <p style="font-size:15px;color:var(--text-disabled);text-align:center;">💡 非营业时间发送的 WhatsApp 消息，我们会在下一个工作日第一时间回复！</p>
        </section>

        <section class="info-section">
          <h2>📍 你可能还想了解…</h2>
          <p>配送政策、运费、退货流程，都在这里。</p>
          <div class="info-cta-buttons">
            <button class="btn btn--ghost" onclick="AppRouter.navigate('delivery')">🚚 查看配送说明</button>
            <button class="btn btn--ghost" onclick="AppRouter.navigate('faq')">💬 常见问题</button>
            <button class="btn btn--ghost" onclick="AppRouter.navigate('about')">📖 关于我们</button>
          </div>
        </section>
      </div>
    </div>`;
  },
};
