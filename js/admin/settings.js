/**
 * settings.js — Admin Site Settings
 * Store info, shipping, WhatsApp, coupon toggle
 */
const AdminSettings = {
  _settings: {},

  async render() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = '<div class="admin-spinner">⏳ 加载设置…</div>';
    await this._fetchSettings();
    this._drawForm();
  },

  async _fetchSettings() {
    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        const { data } = await sb.from('site_settings').select('*');
        if (data) {
          // Convert array of key-value to object
          this._settings = {};
          data.forEach(row => { this._settings[row.key] = row.value; });
          return;
        }
      }
    } catch (err) { console.error('Fetch settings:', err); }

    // Defaults
    this._settings = {
      store_name: '金牌漫画',
      store_tagline: '中文漫画专卖店',
      whatsapp_number: '+60123456789',
      store_email: 'jerrcoc1@gmail.com',
      shipping_west: '8',
      shipping_east: '15',
      free_shipping: '150',
      about_text: '金牌漫画 - 你的中文漫画专卖店。提供最新、最热门的中文漫画。',
      coupons_enabled: 'false',
      points_enabled: 'false',
    };
  },

  _drawForm() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const s = this._settings;

    content.innerHTML = `
      <div class="table-container">
        <div class="table-toolbar">
          <span class="table-toolbar__title">⚙️ 商店设置</span>
        </div>
        <div style="padding: 24px;">
          <form id="settings-form" novalidate>
            <h4 style="margin-bottom:12px;color:#4a5568;font-size:14px;">📛 商店信息</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="set-store-name">商店名称</label>
                <input class="form-group__input" type="text" id="set-store-name"
                       value="${this._esc(s.store_name || '')}" required>
              </div>
              <div class="form-group">
                <label class="form-group__label" for="set-store-tagline">标语</label>
                <input class="form-group__input" type="text" id="set-store-tagline"
                       value="${this._esc(s.store_tagline || '')}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-group__label" for="set-about">关于我们</label>
              <textarea class="form-group__textarea" id="set-about" rows="2">${this._esc(s.about_text || '')}</textarea>
            </div>

            <h4 style="margin:24px 0 12px;color:#4a5568;font-size:14px;">📞 联系方式</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="set-whatsapp">WhatsApp 号码</label>
                <input class="form-group__input" type="text" id="set-whatsapp"
                       value="${this._esc(s.whatsapp_number || '')}" placeholder="+6012-3456789">
                <span class="form-group__help">客户下单后跳转的 WhatsApp 号码</span>
              </div>
              <div class="form-group">
                <label class="form-group__label" for="set-email">商店邮箱</label>
                <input class="form-group__input" type="email" id="set-email"
                       value="${this._esc(s.store_email || '')}">
              </div>
            </div>

            <h4 style="margin:24px 0 12px;color:#4a5568;font-size:14px;">🚚 运费设置</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="set-ship-west">西马运费 (RM)</label>
                <input class="form-group__input" type="number" id="set-ship-west"
                       value="${s.shipping_west || '8'}" step="0.01" min="0">
              </div>
              <div class="form-group">
                <label class="form-group__label" for="set-ship-east">东马运费 (RM)</label>
                <input class="form-group__input" type="number" id="set-ship-east"
                       value="${s.shipping_east || '15'}" step="0.01" min="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-group__label" for="set-free-ship">免运费门槛 (RM)</label>
              <input class="form-group__input" type="number" id="set-free-ship"
                     value="${s.free_shipping || '150'}" step="0.01" min="0">
              <span class="form-group__help">订单满此金额免运费</span>
            </div>

            <h4 style="margin:24px 0 12px;color:#4a5568;font-size:14px;">🎛️ 功能开关</h4>
            <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:8px;">
                <label class="toggle-switch">
                  <input type="checkbox" id="set-coupons" ${s.coupons_enabled === 'true' ? 'checked' : ''}>
                  <span class="toggle-switch__slider"></span>
                </label>
                <span style="font-size:14px;">优惠券系统</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <label class="toggle-switch">
                  <input type="checkbox" id="set-points" ${s.points_enabled === 'true' ? 'checked' : ''}>
                  <span class="toggle-switch__slider"></span>
                </label>
                <span style="font-size:14px;">会员积分</span>
              </div>
            </div>

            <div style="margin-top:24px;">
              <button type="submit" class="btn btn--primary">💾 保存设置</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this._save();
    });
  },

  async _save() {
    const data = {
      store_name: document.getElementById('set-store-name').value.trim(),
      store_tagline: document.getElementById('set-store-tagline').value.trim(),
      about_text: document.getElementById('set-about').value.trim(),
      whatsapp_number: document.getElementById('set-whatsapp').value.trim(),
      store_email: document.getElementById('set-email').value.trim(),
      shipping_west: document.getElementById('set-ship-west').value,
      shipping_east: document.getElementById('set-ship-east').value,
      free_shipping: document.getElementById('set-free-ship').value,
      coupons_enabled: document.getElementById('set-coupons').checked ? 'true' : 'false',
      points_enabled: document.getElementById('set-points').checked ? 'true' : 'false',
    };

    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        // Upsert each setting
        for (const [key, value] of Object.entries(data)) {
          await sb.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        }
      }

      AdminAuth.toast('✅ 设置已保存', 'success');
    } catch (err) {
      AdminAuth.toast('保存失败: ' + (err.message || '未知错误'), 'error');
      console.error('Save settings:', err);
    }
  },

  _esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  },
};
