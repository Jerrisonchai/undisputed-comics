/**
 * dashboard.js — Admin Dashboard
 * Stats cards + period filters + order chart
 */
const AdminDashboard = {
  _data: null,
  _period: '30days', // '7days' | '30days' | '90days' | 'all'

  async render() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = '<div class="admin-spinner">⏳ 加载中…</div>';

    await this._fetchStats();
    this._draw();
  },

  async _fetchStats() {
    const sb = AdminAuth._getClient();
    if (!sb) return;

    try {
      const now = new Date();
      let since;
      if (this._period === '7days') since = new Date(now - 7 * 86400000).toISOString();
      else if (this._period === '30days') since = new Date(now - 30 * 86400000).toISOString();
      else if (this._period === '90days') since = new Date(now - 90 * 86400000).toISOString();

      // Products count
      const { count: totalProducts } = await sb
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Active products
      const { count: activeProducts } = await sb
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('stock_status', 'in_stock');

      // Orders in period
      let orderQuery = sb.from('orders').select('*', { count: 'exact', head: true });
      if (since) orderQuery = orderQuery.gte('created_at', since);
      const { count: totalOrders } = await orderQuery;

      // Revenue in period
      let revQuery = sb.from('orders').select('total');
      if (since) revQuery = revQuery.gte('created_at', since);
      const { data: orders } = await revQuery;

      const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;

      // Pending orders
      const { count: pendingOrders } = await sb
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Customers (profiles)
      const { count: totalCustomers } = await sb
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      // Ratings count
      const { count: totalRatings } = await sb
        .from('ratings')
        .select('*', { count: 'exact', head: true });

      this._data = {
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue: totalRevenue || 0,
        totalCustomers: totalCustomers || 0,
        totalRatings: totalRatings || 0,
      };
    } catch (err) {
      console.error('Dashboard stats:', err);
      this._data = { totalProducts: 0, activeProducts: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0, totalCustomers: 0, totalRatings: 0 };
    }
  },

  _draw() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const d = this._data;
    const periodLabels = { '7days': '最近 7 天', '30days': '最近 30 天', '90days': '最近 90 天', 'all': '全部' };

    content.innerHTML = `
      <!-- Period Selector -->
      <div class="period-selector">
        ${Object.entries(periodLabels).map(([k, v]) => `
          <button class="period-selector__btn${this._period === k ? ' active' : ''}" data-period="${k}">${v}</button>
        `).join('')}
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon">💰</div>
          <div class="stat-card__label">总营业额</div>
          <div class="stat-card__value">RM ${d.totalRevenue.toFixed(2)}</div>
          <div class="stat-card__sub">${periodLabels[this._period]}</div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">📦</div>
          <div class="stat-card__label">订单总数</div>
          <div class="stat-card__value">${d.totalOrders}</div>
          <div class="stat-card__sub">${d.pendingOrders} 待处理</div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">📚</div>
          <div class="stat-card__label">商品总数</div>
          <div class="stat-card__value">${d.totalProducts}</div>
          <div class="stat-card__sub">${d.activeProducts} 有库存</div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">👥</div>
          <div class="stat-card__label">注册用户</div>
          <div class="stat-card__value">${d.totalCustomers}</div>
          <div class="stat-card__sub">${d.totalRatings} 条评分</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="table-container" style="margin-top: 8px;">
        <div class="table-toolbar">
          <span class="table-toolbar__title">⚡ 快捷操作</span>
        </div>
        <div style="padding: 20px 24px; display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn--primary" id="dash-add-product">➕ 添加商品</button>
          <button class="btn btn--secondary" id="dash-view-orders">📋 查看待处理订单</button>
          <button class="btn btn--secondary" id="dash-view-site" onclick="window.open('../','_blank')">🌐 预览网站</button>
        </div>
      </div>
    `;

    // Bind period buttons
    content.querySelectorAll('.period-selector__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._period = btn.dataset.period;
        this.render();
      });
    });

    // Bind quick actions
    document.getElementById('dash-add-product')?.addEventListener('click', () => {
      AdminRouter.navigate('products', { action: 'add' });
    });
    document.getElementById('dash-view-orders')?.addEventListener('click', () => {
      AdminRouter.navigate('orders');
    });
  },
};
