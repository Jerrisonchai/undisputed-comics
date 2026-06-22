/**
 * about.js — About Us (关于我们)
 * UndisputedComics (金牌漫画) v2.6
 * Static about page with brand story
 */
const PageAbout = {
  _copy: {},

  async init() {
    // Load copywriting for dynamic overrides
    try {
      this._copy = await Utils.loadJSON('data/copywriting.json') || {};
    } catch {
      this._copy = {};
    }
    this._render();
  },

  bindEvents() {
    // No interactive elements needed
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const c = this._copy.about || {};
    main.innerHTML = `
    <div class="page" id="about-page">
      <div class="about-hero">
        <div class="about-hero__icon">🏆</div>
        <h1 class="about-hero__title">${c.title || '关于金牌漫画'}</h1>
        <p class="about-hero__subtitle">${c.subtitle || '品质漫画，金牌之选'}</p>
      </div>

      <div class="about-content">
        <section class="about-section">
          <h2>📖 我们的故事</h2>
          <p>${c.story || '金牌漫画创立于2024年，致力于为马来西亚中文读者提供最优质的正版中文漫画。我们深知漫画不仅仅是娱乐——它是一种文化，一种热情，一种连接华语世界的桥梁。'}</p>
          <p>从《海贼王》到《咒术迴战》，从经典港漫到最新日漫译本，我们精心挑选每一本漫画，确保它们以最好的状态送到您手中。</p>
        </section>

        <section class="about-section">
          <h2>🎯 我们的使命</h2>
          <div class="about-values">
            <div class="about-value-card">
              <div class="about-value-card__icon">📚</div>
              <h3>品质保证</h3>
              <p>每一本漫画都经过严格筛选，只提供正版授权产品。</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-card__icon">🚀</div>
              <h3>快速配送</h3>
              <p>全马配送，西马最快2-3天送达。</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-card__icon">💰</div>
              <h3>合理价格</h3>
              <p>直接与出版商合作，为您提供最具竞争力的价格。</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-card__icon">💬</div>
              <h3>贴心服务</h3>
              <p>WhatsApp即时客服，随时为您解答疑问。</p>
            </div>
          </div>
        </section>

        <section class="about-section">
          <h2>👥 我们的团队</h2>
          <p>金牌漫画由一群热爱漫画的马来西亚华人创立。我们来自不同背景——有漫画收藏家、有IT工程师、有物流专家——但我们都有一个共同的热情：让更多人享受到阅读中文漫画的乐趣。</p>
          <p>我们的选书团队每月都会关注最新的中文漫画出版动态，确保您能第一时间买到心仪的作品。</p>
        </section>

        <section class="about-section about-section--cta">
          <h2>📬 联系我们</h2>
          <p>有任何问题或建议？欢迎随时联系我们！</p>
          <div class="about-cta-buttons">
            <button class="btn btn--primary" onclick="AppRouter.navigate('contact')">📧 联系我们</button>
            <button class="btn btn--ghost" onclick="AppRouter.navigate('home')">🏠 返回首页</button>
          </div>
        </section>
      </div>
    </div>`;
  },
};
