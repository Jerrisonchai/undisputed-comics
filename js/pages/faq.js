/**
 * faq.js — AI Chatbot FAQ (常见问题)
 * UndisputedComics (金牌漫画) v2.8 — Copywriting Polish
 * Keyword-matching chatbot with 12 FAQ topics + Malaysian context
 */
const PageFAQ = {
  _faq: [],
  _chatHistory: [],

  async init() {
    this._faq = [
      {
        keywords: ['运费', '配送费', '邮费', 'shipping', 'delivery', '邮寄', '包邮', '免邮', 'free shipping'],
        question: '运费怎么算？',
        answer: `西马运费 RM8，东马 RM15。<br><br>🎉 <strong>订单满 RM150 免运费！</strong><br><br>📦 西马：2-3 个工作日<br>📦 东马：5-7 个工作日<br><br>查看完整 <a href="#delivery">配送说明</a> 👈`
      },
      {
        keywords: ['发货', '多久', '时间', '送达', '配送时间', '几时', '几久'],
        question: '什么时候发货？多久能收到？',
        answer: '确认付款后 <strong>24 小时内发货</strong>！ ⚡<br><br>📍 巴生谷：1-2 个工作日<br>📍 西马其他：2-4 个工作日<br>📍 东马：5-7 个工作日<br><br>发货后会通过 WhatsApp 发送追踪号码给你～'
      },
      {
        keywords: ['付款', '支付', '钱', 'bank', '转账', 'ewallet', 'tng', 'touch', 'maybank', 'cimb', '怎样给钱'],
        question: '如何付款？',
        answer: '我们接受以下付款方式 💰<br><br>🏦 <strong>银行转账</strong><br>• Maybank<br>• CIMB<br>• Public Bank<br><br>📱 <strong>Touch \'n Go eWallet</strong><br><br>下单后我们会 WhatsApp 发送付款详情，方便快捷！'
      },
      {
        keywords: ['退货', '退款', '换货', '退钱', '损坏', 'refund', 'return', '破了', '烂了'],
        question: '可以退货或退款吗？',
        answer: '当然可以！我们非常重视你的权益 ❤️<br><br>✅ 商品损坏 → <strong>换货或全额退款</strong><br>✅ 发错商品 → <strong>换货或全额退款</strong><br>❌ 个人原因退货 → 暂不支持<br><br>📸 请在收到包裹 <strong>24 小时内</strong> 拍照 WhatsApp 联系我们，马上处理！'
      },
      {
        keywords: ['正版', '盗版', '版权', '授权', 'original', 'authentic', '是不是正版', '真货'],
        question: '你们的漫画是正版吗？',
        answer: '<strong>100% 正版授权！</strong> ✅✅✅<br><br>我们直接与台湾和香港正规出版社合作：<br>📚 东立出版社<br>📚 青文出版社<br>📚 尖端出版<br>📚 天下出版<br><br>每一本都是正版，品质保证，安心购买！'
      },
      {
        keywords: ['预购', '预订', '预定', 'preorder', 'pre-order', '还没出'],
        question: '支持预购吗？',
        answer: '支持！部分即将出版的漫画开放预购 🔖<br><br>🔖 预购商品会在封面标注「预购中」<br>📅 出版后 1-2 周内发货<br>💰 预购价有时比正式价更便宜哦<br><br>预购是确保第一时间拿到热门新书的最佳方式！'
      },
      {
        keywords: ['语言', '中文', '英文', 'language', 'chinese', 'english', '简体', '繁体', '什么字'],
        question: '漫画是什么语言的？',
        answer: '我们主要销售 <strong>繁体中文</strong> 漫画 🇹🇼🇭🇰<br><br>来自台湾和香港的正规出版商，原汁原味的翻译品质。<br><br>部分商品可能有简体中文或英文版，会在商品描述中注明～'
      },
      {
        keywords: ['会员', '账号', '注册', '积分', 'points', 'member', 'sign up', '做会员'],
        question: '有会员制度吗？',
        answer: '🏗️ 会员积分系统即将上线！敬请期待～<br><br>目前注册账号可以：<br>✅ 保存收藏清单 ❤️<br>✅ 查看订单历史 📋<br>✅ 评价购买的商品 ⭐<br><br>未来积分上线后，购物累积积分兑换优惠！先注册不吃亏 😉'
      },
      {
        keywords: ['优惠', '折扣', '便宜', 'discount', 'coupon', 'promo', '特价', 'offer', '有扣吗'],
        question: '有折扣或优惠码吗？',
        answer: '🏗️ 优惠码系统开发中，但我们现在就有不少好康！<br><br>✅ <strong>满 RM150 免运费</strong><br>✅ 新书上架优惠价<br>✅ 精选商品特价<br>✅ 有些书直接打折（看价格标签 🔖）<br><br>关注我们的 WhatsApp 获取最新促销消息！'
      },
      {
        keywords: ['联系方式', 'contact', '客服', 'whatsapp', '电话', 'email', '电邮', '联络', '找谁'],
        question: '如何联系客服？',
        answer: '多种方式任你选！📬<br><br>💬 <strong>WhatsApp：</strong><a href="#contact">点击查看号码</a><br>📧 <strong>电子邮件：</strong><a href="#contact">点击查看邮箱</a><br><br>⏰ 营业时间：周一至周五 9AM-9PM，周六 10AM-6PM<br>我们会在工作时间内尽快回复！'
      },
      {
        keywords: ['包装', '包裹', '包装方式', 'packing', '怎样包', '保护'],
        question: '漫画如何包装？',
        answer: '我们非常重视包装！📦💪<br><br>✅ 每本漫画先用泡泡纸包裹<br>✅ 放入加厚瓦楞纸箱<br>✅ 空隙填充缓冲材料<br>✅ 最外层防水快递袋<br><br>多重保护，确保你的宝贝安全到家！'
      },
      {
        keywords: ['hi', 'hello', '你好', '您好', '哈咯', 'halo', '帮助', 'help', '帮忙'],
        question: '你好！有什么可以帮你的？',
        answer: '你好！👋 欢迎来到金牌漫画～<br><br>你可以问我这些问题：<br>📦 运费和配送<br>💰 付款方式<br>📚 正版保证<br>🔄 退货退款<br>📬 联系我们<br><br>直接打字问我就行，或者点下面的快捷按钮！'
      },
    ];

    this._chatHistory = [];
    this._render();
  },

  bindEvents() {
    const input = document.getElementById('faq-input');
    const sendBtn = document.getElementById('faq-send');

    const ask = () => {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      this._ask(q);
    };

    sendBtn?.addEventListener('click', ask);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') ask();
    });

    document.querySelectorAll('.faq-suggestion').forEach(el => {
      el.addEventListener('click', () => {
        this._ask(el.textContent.replace(/^[^\s]+\s*/, '').trim() || el.textContent.trim());
      });
    });
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
    <div class="page" id="faq-page">
      <div class="info-hero info-hero--sm">
        <div class="info-hero__icon">🤖</div>
        <h1>常见问题</h1>
        <p>AI 小助手在线解答 · 随时问我任何问题！</p>
      </div>

      <div class="faq-chat" id="faq-chat">
        <div class="faq-msg faq-msg--bot">
          <div class="faq-msg__avatar">🤖</div>
          <div class="faq-msg__bubble">
            你好！👋 我是金牌漫画的 AI 小助手～<br><br>
            关于漫画、订单、配送、付款……什么问题都可以问我！<br>
            直接打字，或者点击下面的快捷问题试试看 😊
          </div>
        </div>
      </div>

      <div class="faq-suggestions" id="faq-suggestions">
        <button class="faq-suggestion">📦 运费怎么算？</button>
        <button class="faq-suggestion">💰 如何付款？</button>
        <button class="faq-suggestion">✅ 是正版吗？</button>
        <button class="faq-suggestion">🔄 可以退货吗？</button>
        <button class="faq-suggestion">⏱️ 多久能收到？</button>
        <button class="faq-suggestion">📬 怎么联系客服？</button>
      </div>

      <div class="faq-input-bar">
        <input type="text"
               class="faq-input-bar__input"
               id="faq-input"
               placeholder="输入你的问题… 比如：运费多少？"
               autocomplete="off">
        <button class="faq-input-bar__send" id="faq-send" aria-label="发送">➤</button>
      </div>
    </div>`;

    setTimeout(() => this._scrollChat(), 300);
  },

  _ask(question) {
    this._addMessage('user', question);
    const answer = this._findAnswer(question);

    const typingEl = this._addTypingIndicator();
    this._scrollChat();

    const delay = 600 + Math.min(answer.length * 15, 2000) + Math.random() * 600;
    setTimeout(() => {
      typingEl?.remove();
      this._addMessage('bot', answer);
      this._scrollChat();
    }, delay);
  },

  _findAnswer(query) {
    const q = query.toLowerCase();
    const scored = this._faq.map(entry => {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw.toLowerCase())) score += 1;
        if (q === kw.toLowerCase()) score += 2;
      }
      return { entry, score };
    });

    scored.sort((a, b) => b.score - a.score);

    if (scored[0] && scored[0].score > 0) {
      return scored[0].entry.answer;
    }

    return `抱歉，我没有找到关于「<strong>${query}</strong>」的答案 😅<br><br>你可以试试问：<br>📦 运费和配送<br>💰 付款方式<br>📚 正版保证<br>🔄 退货退款<br>📬 联系我们<br><br>或者直接 <a href="#contact">WhatsApp 人工客服</a>，我们很乐意帮你！`;
  },

  _addMessage(type, text) {
    const chat = document.getElementById('faq-chat');
    if (!chat) return;

    const msg = document.createElement('div');
    msg.className = `faq-msg faq-msg--${type}`;
    msg.innerHTML = `
      <div class="faq-msg__avatar">${type === 'bot' ? '🤖' : '👤'}</div>
      <div class="faq-msg__bubble">${text.replace(/\n/g, '<br>')}</div>
    `;
    chat.appendChild(msg);
  },

  _scrollChat() {
    const chat = document.getElementById('faq-chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  },

  _addTypingIndicator() {
    const chat = document.getElementById('faq-chat');
    if (!chat) return null;

    const el = document.createElement('div');
    el.className = 'faq-msg faq-msg--bot faq-msg--typing';
    el.innerHTML = `
      <div class="faq-msg__avatar">🤖</div>
      <div class="faq-msg__bubble faq-typing">
        <span class="faq-typing__dot"></span>
        <span class="faq-typing__dot"></span>
        <span class="faq-typing__dot"></span>
      </div>
    `;
    chat.appendChild(el);
    return el;
  },
};
