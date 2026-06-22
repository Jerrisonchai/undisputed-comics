/**
 * faq.js — AI Chatbot FAQ (常见问题)
 * UndisputedComics (金牌漫画) v2.6
 * Keyword-matching chatbot with predefined FAQ database
 */
const PageFAQ = {
  _faq: [],
  _chatHistory: [],

  async init() {
    // FAQ database (can be extended via copywriting.json)
    this._faq = [
      {
        keywords: ['运费', '配送费', '邮费', 'shipping', 'delivery'],
        question: '运费怎么算？',
        answer: `西马运费 RM8，东马 RM15。订单满 RM150 免运费！\n\n📦 西马：2-3 个工作日\n📦 东马：5-7 个工作日\n\n查看完整<a href="#delivery">配送说明</a>。`
      },
      {
        keywords: ['发货', '多久', '时间', '送达', '配送时间'],
        question: '什么时候发货？多久能收到？',
        answer: '确认付款后 <strong>24 小时内发货</strong>。\n\n📍 巴生谷：1-2 个工作日\n📍 西马其他：2-4 个工作日\n📍 东马：5-7 个工作日\n\n发货后会通过 WhatsApp 发送追踪号码。'
      },
      {
        keywords: ['付款', '支付', '钱', 'bank', '转账', 'ewallet', 'tng', 'touch'],
        question: '如何付款？',
        answer: '我们接受以下付款方式：\n\n🏦 <strong>银行转账</strong>（Maybank / CIMB / Public Bank）\n📱 <strong>Touch 'n Go eWallet</strong>\n\n下单后我们会通过 WhatsApp 发送付款详情。'
      },
      {
        keywords: ['退货', '退款', '换货', '退钱', '损坏', 'refund', 'return'],
        question: '可以退货或退款吗？',
        answer: '如果您收到的商品有损坏，请在 <strong>24 小时内</strong> 拍照并通过 WhatsApp 联系我们。\n\n✅ 商品损坏 → 换货或退款\n✅ 发错商品 → 换货或退款\n❌ 个人原因退货 → 暂不支持\n\n我们会认真处理每一个问题！'
      },
      {
        keywords: ['正版', '盗版', '版权', '授权', 'original', 'authentic'],
        question: '你们的漫画是正版吗？',
        answer: '<strong>100% 正版授权！</strong> ✅\n\n我们直接与台湾和香港的正规出版商合作（东立、青文、尖端、天下等），每一本漫画都经过正版授权。\n\n您可以放心购买，品质有保证！'
      },
      {
        keywords: ['预购', '预订', '预定', 'preorder', 'pre-order'],
        question: '支持预购吗？',
        answer: '是的！部分即将出版的漫画支持预购。\n\n🔖 预购商品会在商品页标注「预购中」\n📅 预购商品通常会在出版后 1-2 周内发货\n💰 预购价格可能与正式价格有所不同\n\n预购是确保您能第一时间拿到热门新书的好方式！'
      },
      {
        keywords: ['语言', '中文', '英文', 'language', 'chinese', 'english'],
        question: '漫画是什么语言的？',
        answer: '我们销售的是 <strong>繁体中文</strong> 漫画，主要来自台湾和香港的出版商。\n\n部分商品也可能提供简体中文或英文版本，会在商品描述中注明。'
      },
      {
        keywords: ['会员', '账号', '注册', '积分', 'points', 'member'],
        question: '有会员制度吗？',
        answer: '🏗️ 会员积分系统即将上线！\n\n目前您可以注册账号来：\n✅ 保存收藏清单\n✅ 查看订单历史\n✅ 评价商品\n\n未来积分系统上线后，购物可累积积分兑换优惠！'
      },
      {
        keywords: ['优惠', '折扣', '便宜', 'discount', 'coupon', 'promo'],
        question: '有折扣或优惠码吗？',
        answer: '🏗️ 优惠码系统正在开发中！\n\n目前我们提供：\n✅ 满 RM150 免运费\n✅ 新书上架优惠\n✅ 特定商品特价\n\n关注我们的 WhatsApp 频道获取最新优惠信息！'
      },
      {
        keywords: ['联系方式', 'contact', '客服', 'whatsapp', '电话', 'email', '电邮'],
        question: '如何联系客服？',
        answer: '📬 多种方式联系我们：\n\n💬 WhatsApp：<a href="#contact">查看联系页面</a>\n📧 电子邮件：<a href="#contact">查看联系页面</a>\n⏰ 营业时间：周一至周五 9AM-9PM，周六 10AM-6PM\n\n我们会在工作时间内尽快回复！'
      },
      {
        keywords: ['包装', '包裹', '包装方式', 'packing'],
        question: '漫画如何包装？',
        answer: '我们非常重视包装质量！📦\n\n✅ 每本漫画先用泡泡纸包裹\n✅ 放入加固纸箱\n✅ 空隙填充缓冲材料\n✅ 外层防水包装\n\n确保您的漫画安全到达，不受损坏！'
      },
      {
        keywords: ['hi', 'hello', '你好', '您好', '哈咯', 'halo', '帮助', 'help'],
        question: '你好！有什么可以帮你的？',
        answer: '你好！👋 欢迎来到金牌漫画常见问题。\n\n您可以问我：\n📦 运费和配送\n💰 付款方式\n📚 商品和正版\n🔄 退货退款\n📬 联系我们\n\n直接输入您的问题，我会尽力解答！'
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

    // Suggested questions
    document.querySelectorAll('.faq-suggestion').forEach(el => {
      el.addEventListener('click', () => {
        this._ask(el.textContent.trim());
        // Scroll suggestions out of view on mobile
        el.parentElement?.scrollIntoView({ behavior: 'smooth' });
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
        <p>AI 客服助手，随时为您解答</p>
      </div>

      <div class="faq-chat" id="faq-chat">
        <!-- Bot greeting -->
        <div class="faq-msg faq-msg--bot">
          <div class="faq-msg__avatar">🤖</div>
          <div class="faq-msg__bubble">
            你好！👋 我是金牌漫画的 AI 客服助手。<br>
            有什么可以帮助你的？你可以直接输入问题，或者点击下面的常见问题。
          </div>
        </div>
      </div>

      <!-- Suggested questions -->
      <div class="faq-suggestions" id="faq-suggestions">
        <button class="faq-suggestion">📦 运费怎么算？</button>
        <button class="faq-suggestion">💰 如何付款？</button>
        <button class="faq-suggestion">🔄 可以退货吗？</button>
        <button class="faq-suggestion">✅ 是正版吗？</button>
        <button class="faq-suggestion">⏱️ 多久能收到？</button>
        <button class="faq-suggestion">📬 怎么联系客服？</button>
      </div>

      <!-- Input bar -->
      <div class="faq-input-bar">
        <input type="text"
               class="faq-input-bar__input"
               id="faq-input"
               placeholder="输入你的问题..."
               autocomplete="off">
        <button class="faq-input-bar__send" id="faq-send" aria-label="发送">➤</button>
      </div>
    </div>`;

    // Scroll chat to bottom after a moment
    setTimeout(() => this._scrollChat(), 300);
  },

  _ask(question) {
    // Add user message
    this._addMessage('user', question);

    // Find best match
    const answer = this._findAnswer(question);

    // Simulate typing delay
    setTimeout(() => {
      this._addMessage('bot', answer);
      this._scrollChat();
    }, 500 + Math.random() * 800);
  },

  _findAnswer(query) {
    const q = query.toLowerCase();

    // Score each FAQ entry by keyword matches
    const scored = this._faq.map(entry => {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw.toLowerCase())) score += 1;
        // Bonus for exact keyword match
        if (q === kw.toLowerCase()) score += 2;
      }
      return { entry, score };
    });

    // Sort by score, take best
    scored.sort((a, b) => b.score - a.score);

    if (scored[0] && scored[0].score > 0) {
      return scored[0].entry.answer;
    }

    // No match — suggest topics
    return `抱歉，我没有找到与「${query}」相关的答案。😅\n\n您可以尝试问：\n📦 运费和配送\n💰 付款方式\n📚 商品和正版\n🔄 退货退款\n📬 联系我们\n\n或者通过 <a href="#contact">WhatsApp</a> 联系人工客服！`;
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
};
