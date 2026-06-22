/**
 * about.js — About Us (关于我们)
 * UndisputedComics (金牌漫画) v2.8 — Copywriting Polish
 * Poetic brand manifesto + story + values
 */
const PageAbout = {
  _copy: {},

  async init() {
    try {
      this._copy = await Utils.loadJSON('data/copywriting.json') || {};
    } catch {
      this._copy = {};
    }
    this._render();
  },

  bindEvents() {},

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const c = this._copy.about || {};
    main.innerHTML = `
    <div class="page" id="about-page">
      <div class="about-hero">
        <div class="about-hero__icon">🏆</div>
        <h1 class="about-hero__title">${c.title || '关于金牌漫画'}</h1>
        <p class="about-hero__subtitle">${c.subtitle || '品质漫画，金牌之选 · 让每一页都值得珍藏'}</p>
      </div>

      <div class="about-content">
        <section class="about-section">
          <h2>📖 我们的故事</h2>
          <p>${c.story || '金牌漫画诞生于2024年，由一群热爱漫画的马来西亚华人创立。我们深知——漫画不仅仅是娱乐。它是一种文化，一份热情，一座连接华语世界的桥梁。'}</p>
          <p>从热血沸腾的《海贼王》到烧脑悬疑的《怪物》，从经典港漫到最新日漫译本，我们走遍各大出版社，只为把最好的漫画带到你手中。</p>
          <p>每一本漫画都经过精心挑选和严格品控——因为我们知道，你翻开书页的那一刻，期待的不只是故事，更是一份快乐。📚✨</p>
        </section>

        <section class="about-section about-section--poetic">
          <p class="about-poem">谢谢还喜欢看漫画的你，感谢你。🌸</p>
          <p class="about-poem">欢迎询问邮寄详情和查看是否有现货。</p>
          <p class="about-poem">旨在为世界各地的书友带来文学气息。</p>
          <p class="about-poem">购买您最喜欢的书籍。</p>
          <p class="about-poem">让你在阅读时代中体验每个多姿多彩的盛开岁月。</p>
          <p class="about-poem about-poem--accent">偶尔也有利落悦耳的翻页声。📖</p>
          <hr class="about-poem__divider">
          <p class="about-poem about-poem--en">To the one who still loves reading comics — thank you. 🌸</p>
          <p class="about-poem about-poem--en">Bringing literary atmosphere to book lovers everywhere.</p>
          <p class="about-poem about-poem--en">Shop your favorite books. Experience every colorful blooming moment.</p>
          <p class="about-poem about-poem--en about-poem--accent">Occasionally, there is a melodious page-turning sound. 📄</p>
        </section>

        <section class="about-section">
          <h2>🎯 我们的承诺</h2>
          <div class="about-values">
            <div class="about-value-card">
              <div class="about-value-card__icon">📚</div>
              <h3>100% 正版</h3>
              <p>直接与台湾香港正规出版社合作<br>东立 · 青文 · 尖端 · 天下</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-card__icon">🚀</div>
              <h3>快速配送</h3>
              <p>全马包邮服务<br>西马最快 2-3 天送到你家门口</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-card__icon">💰</div>
              <h3>超值价格</h3>
              <p>出版社直供，去掉中间商<br>常常有折扣，满额还免邮！</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-card__icon">💬</div>
              <h3>贴心客服</h3>
              <p>WhatsApp 即时回复<br>选书、下单、售后，一路陪着你</p>
            </div>
          </div>
        </section>

        <section class="about-section">
          <h2>👥 我们的团队</h2>
          <p>我们是一群来自不同背景的漫画控——有收藏了上千本漫画的骨灰级藏家，有天天泡在PTT C_Chat 的资深宅，有对物流配送了如指掌的运营达人。</p>
          <p>但我们有一个共同的热情：<strong>让更多马来西亚人享受阅读中文漫画的乐趣。</strong></p>
          <p>我们的选书团队每月追踪最新中文漫画出版动态，确保你第一时间买到心仪的作品。因为爱漫画，所以懂你想要的。❤️</p>
        </section>

        <section class="about-section about-section--cta">
          <h2>📬 有空聊聊？</h2>
          <p>有任何问题、建议、或者只是想聊聊最近在看什么漫画——随时找我们！</p>
          <div class="about-cta-buttons">
            <button class="btn btn--primary" onclick="AppRouter.navigate('contact')">📧 联系我们</button>
            <button class="btn btn--ghost" onclick="AppRouter.navigate('faq')">💬 常见问题</button>
          </div>
        </section>
      </div>
    </div>`;
  },
};
