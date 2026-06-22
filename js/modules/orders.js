/**
 * orders.js — Orders Module
 * UndisputedComics (金牌漫画) v2.0
 * Order creation, history. LocalStorage until Supabase (Phase 4).
 */

const OrdersModule = {
  /**
   * Create a new order from cart + customer info
   * @param {Object} customer - { name, phone, email, notes }
   * @param {string} region - 'west' | 'east'
   * @param {string|null} userId - current user id if logged in
   * @returns {Object} Created order
   */
  create(customer = {}, region = 'west', userId = null) {
    const items = CartModule.getItems();
    if (!items.length) throw new Error('购物车为空');

    const totals = CartModule.totals(region);

    const order = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
      userId: userId || null,
      items: items.map(i => ({
        id: i.id,
        title_zh: i.title_zh,
        price: i.price,
        qty: i.qty || 1,
        cover_image: i.cover_image,
      })),
      customer: {
        name: customer.name?.trim() || '',
        phone: customer.phone?.trim() || '',
        email: customer.email?.trim() || '',
        notes: customer.notes?.trim() || '',
      },
      region,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this._saveToHistory(order);

    // Phase 6: Queue order confirmation email
    this._queueOrderConfirmation(order);

    return order;
  },

  /**
   * Generate WhatsApp checkout message
   * @param {Object} order
   * @returns {string}
   */
  getWhatsAppMessage(order) {
    return Utils.formatOrderMessage(order.items, {
      name: order.customer.name,
      phone: order.customer.phone,
      email: order.customer.email,
      notes: order.customer.notes,
      total: order.total,
      discount: 0,
      pointsRedeemed: 0,
    });
  },

  /**
   * Get WhatsApp checkout URL
   * @param {Object} order
   * @returns {string}
   */
  getWhatsAppUrl(order) {
    const phone = window.AppConfig?.store?.phone || '+60123456789';
    const message = this.getWhatsAppMessage(order);
    return Utils.whatsappUrl(phone, message);
  },

  /**
   * Save order to localStorage history
   * @param {Object} order
   */
  _saveToHistory(order) {
    const history = Storage.get('orders', []);
    history.unshift(order);
    Storage.set('orders', history, 30 * 24 * 60 * 60 * 1000); // 30 day TTL
  },

  /**
   * Create order from raw data (used by API.js as fallback)
   */
  _createLocal(orderData) {
    const order = {
      id: orderData.id || 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
      userId: orderData.user_id || null,
      items: [],
      customer: {
        name: orderData.customer_name || '',
        phone: orderData.customer_phone || '',
        email: orderData.customer_email || '',
        notes: orderData.notes || '',
      },
      subtotal: orderData.subtotal || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total || 0,
      status: orderData.status || 'pending',
      createdAt: orderData.created_at || new Date().toISOString(),
    };
    this._saveToHistory(order);
    return order;
  },

  /**
   * Get order history
   * @returns {Array}
   */
  getHistory() {
    return Storage.get('orders', []);
  },

  /**
   * Get orders for a specific user
   * @param {string} userId
   * @returns {Array}
   */
  getUserHistory(userId) {
    return this.getHistory().filter(o => o.userId === userId);
  },

  /**
   * Get all orders (alias for account page)
   * @returns {Array}
   */
  getAll() {
    return this.getHistory();
  },

  /**
   * Get a single order by ID
   * @param {string} orderId
   * @returns {Object|null}
   */
  getById(orderId) {
    return this.getHistory().find(o => o.id === orderId) || null;
  },

  /**
   * Update order status (for admin)
   * @param {string} orderId
   * @param {string} status
   */
  updateStatus(orderId, status) {
    const history = this.getHistory();
    const order = history.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      Storage.set('orders', history);

      // Phase 6: Queue shipping notification
      if (status === 'shipped' && order.customer?.email) {
        const itemsList = (order.items || []).map(i => `${i.qty}x ${i.title_zh}`).join(', ');
        EmailModule.queueNotification({
          type: 'shipped',
          recipient_email: order.customer.email,
          recipient_name: order.customer.name,
          subject: `📦 您的订单已发货！${order.id}`,
          body_html: `<p>${order.customer.name || '您好'}，您好！</p>
<p>您的订单 <strong>${order.id}</strong> 已发货。</p>
<p><strong>订单内容：</strong>${itemsList}</p>
<p><strong>订单金额：</strong>RM${parseFloat(order.total).toFixed(2)}</p>
<p>预计 2-7 个工作日送达。如有问题，请通过 WhatsApp 联系我们。</p>
<p>感谢您在金牌漫画购物！📚</p>`,
          order_id: order.id,
        }).catch(() => {});
      }
    }
  },

  /**
   * Queue order confirmation email (Phase 6)
   */
  _queueOrderConfirmation(order) {
    if (!order.customer?.email) return;

    const itemsList = (order.items || []).map(i => `${i.qty}x ${i.title_zh}`).join(', ');
    EmailModule.queueNotification({
      type: 'order',
      recipient_email: order.customer.email,
      recipient_name: order.customer.name,
      subject: `🛒 订单确认 — ${order.id}`,
      body_html: `<p>${order.customer.name || '您好'}，您好！</p>
<p>感谢您在 <strong>金牌漫画</strong> 下单！</p>
<p><strong>订单编号：</strong>${order.id}</p>
<p><strong>订单内容：</strong>${itemsList}</p>
<p><strong>订单金额：</strong>RM${parseFloat(order.total).toFixed(2)}</p>
<p>我们会在确认付款后 24 小时内发货。发货后会通过邮件和 WhatsApp 通知您。</p>
<p>如有任何问题，欢迎 WhatsApp 联系。</p>
<p>感谢您的支持！📚</p>`,
      order_id: order.id,
    }).catch(() => {});
  },
};
