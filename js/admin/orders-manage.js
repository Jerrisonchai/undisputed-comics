/**
 * orders-manage.js — Admin Order Management
 * List all orders, filter by status, update status, view detail
 */
const AdminOrders = {
  _orders: [],

  async render() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = '<div class="admin-spinner">⏳ 加载订单…</div>';
    await this._fetchOrders();
    this._drawTable();
  },

  async _fetchOrders() {
    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        const { data: orders } = await sb.from('orders').select('*').order('created_at', { ascending: false });
        if (orders) {
          // Fetch order items for each order
          for (const order of orders) {
            const { data: items } = await sb.from('order_items').select('*').eq('order_id', order.id);
            order.items = items || [];
          }
          this._orders = orders;
          return;
        }
      }
    } catch (err) { console.error('Fetch orders:', err); }

    // Fallback to localStorage
    this._orders = OrdersModule.getAll?.() || [];
  },

  _drawTable() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const statusLabels = {
      pending: '待处理',
      confirmed: '已确认',
      shipped: '已发货',
      delivered: '已签收',
      cancelled: '已取消',
    };

    content.innerHTML = `
      <div class="table-container">
        <div class="table-toolbar">
          <span class="table-toolbar__title">📦 订单管理 (${this._orders.length})</span>
          <div class="table-toolbar__actions">
            <select class="form-group__select" id="order-status-filter" style="width:auto;padding:6px 12px;font-size:13px;">
              <option value="all">全部状态</option>
              ${Object.entries(statusLabels).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户</th>
                <th>商品</th>
                <th>金额</th>
                <th>状态</th>
                <th>日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="orders-tbody">
              ${this._orders.map(o => `
                <tr data-status="${o.status}">
                  <td style="font-family:monospace;font-size:12px;">${o.id?.substring(0, 8)}…</td>
                  <td>
                    <strong>${this._esc(o.customer_name)}</strong>
                    <br><small style="color:#718096;">${this._esc(o.customer_phone || '')}</small>
                  </td>
                  <td>${(o.items || []).length} 件</td>
                  <td>RM ${(o.total || 0).toFixed(2)}</td>
                  <td><span class="status-badge status-badge--${o.status}">${statusLabels[o.status] || o.status}</span></td>
                  <td style="font-size:12px;color:#718096;">${this._formatDate(o.created_at)}</td>
                  <td style="display:flex;gap:6px;">
                    <button class="btn btn--secondary btn--xs btn-view-order" data-order-id="${o.id}">👁️</button>
                    ${this._renderStatusActions(o)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._bindTableEvents();
  },

  _renderStatusActions(order) {
    if (order.status === 'delivered' || order.status === 'cancelled') return '';

    const next = {
      pending: { status: 'confirmed', label: '确认' },
      confirmed: { status: 'shipped', label: '发货' },
      shipped: { status: 'delivered', label: '签收' },
    }[order.status];

    if (!next) return '';

    return `
      <button class="btn btn--primary btn--xs btn-advance-status" data-order-id="${order.id}" data-next="${next.status}">${next.label}</button>
    `;
  },

  _bindTableEvents() {
    // Status filter
    document.getElementById('order-status-filter')?.addEventListener('change', (e) => {
      const val = e.target.value;
      document.querySelectorAll('#orders-tbody tr').forEach(tr => {
        tr.style.display = val === 'all' || tr.dataset.status === val ? '' : 'none';
      });
    });

    // View detail
    document.querySelectorAll('.btn-view-order').forEach(btn => {
      btn.addEventListener('click', () => this._viewOrder(btn.dataset.orderId));
    });

    // Advance status
    document.querySelectorAll('.btn-advance-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this._updateStatus(btn.dataset.orderId, btn.dataset.next);
      });
    });
  },

  async _updateStatus(orderId, newStatus) {
    const labels = { confirmed: '已确认', shipped: '已发货', delivered: '已签收', cancelled: '已取消' };
    if (!confirm(`确定将订单状态改为「${labels[newStatus]}」吗？`)) return;

    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        const { error } = await sb.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);
        if (error) throw error;
      }
      AdminAuth.toast(`✅ 状态已更新为「${labels[newStatus]}」`, 'success');
      await this._fetchOrders();
      this._drawTable();
    } catch (err) {
      AdminAuth.toast('更新失败: ' + (err.message || '未知错误'), 'error');
    }
  },

  _viewOrder(orderId) {
    const order = this._orders.find(o => o.id === orderId);
    if (!order) return;

    const statusLabels = {
      pending: '待处理', confirmed: '已确认', shipped: '已发货',
      delivered: '已签收', cancelled: '已取消',
    };
    const items = order.items || [];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">📋 订单详情</h3>
          <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal__body">
          <div style="margin-bottom:20px;padding:16px;background:#f7fafc;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span style="font-size:12px;color:#718096;">订单号</span>
              <strong style="font-family:monospace;">${order.id}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:#718096;">状态</span>
              <span class="status-badge status-badge--${order.status}">${statusLabels[order.status]}</span>
            </div>
          </div>

          <h4 style="margin-bottom:8px;">👤 客户信息</h4>
          <div style="padding:12px;background:#f7fafc;border-radius:8px;margin-bottom:16px;font-size:14px;">
            <p><strong>姓名：</strong>${this._esc(order.customer_name)}</p>
            <p><strong>电话：</strong>${this._esc(order.customer_phone || '-')}</p>
            <p><strong>邮箱：</strong>${this._esc(order.customer_email || '-')}</p>
          </div>

          <h4 style="margin-bottom:8px;">📚 订单商品 (${items.length} 件)</h4>
          <table class="data-table" style="margin-bottom:16px;">
            <thead><tr><th>商品</th><th>数量</th><th>单价</th></tr></thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td>${this._esc(i.product_title || i.title_zh || i.product_id)}</td>
                  <td>${i.quantity || 1}</td>
                  <td>RM ${(i.price || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="display:flex;justify-content:space-between;padding:12px;background:#f7fafc;border-radius:8px;font-size:14px;">
            <div>
              <p>小计: RM ${(order.subtotal || 0).toFixed(2)}</p>
              <p>运费: RM ${(order.shipping || 0).toFixed(2)}</p>
              ${order.discount ? `<p>折扣: -RM ${(order.discount || 0).toFixed(2)}</p>` : ''}
            </div>
            <div style="font-size:18px;font-weight:700;align-self:flex-end;">
              总计: RM ${(order.total || 0).toFixed(2)}
            </div>
          </div>

          <p style="font-size:12px;color:#a0aec0;margin-top:12px;">
            下单时间: ${this._formatDate(order.created_at)}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  _formatDate(ts) {
    if (!ts) return '-';
    try {
      return new Date(ts).toLocaleDateString('zh-MY', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return ts; }
  },

  _esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  },
};
