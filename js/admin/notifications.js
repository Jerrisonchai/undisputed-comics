/**
 * notifications.js — Admin Notification Panel
 * UndisputedComics (金牌漫画) v2.7 — Phase 6
 * Compose & send bulk emails, view notification log, manage subscribers
 */
const AdminNotifications = {
  _tab: 'compose', // compose | log | subscribers

  async render() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = '<div class="admin-spinner">⏳ 加载通知面板…</div>';

    try {
      const [subCount, recentLogs] = await Promise.all([
        EmailModule.getSubscriberCount(),
        EmailModule.getLogs(10),
      ]);
      this._subCount = subCount;
      this._recentLogs = recentLogs;
    } catch (err) {
      console.error('Notifications load error:', err);
      this._subCount = 0;
      this._recentLogs = [];
    }

    this._drawPanel();
  },

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.notif-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this._tab = tab.dataset.tab;
        this._drawPanel();
      });
    });

    // Send button
    document.getElementById('btn-send-notif')?.addEventListener('click', () => this._handleSend());

    // Preview button
    document.getElementById('btn-preview-notif')?.addEventListener('click', () => this._handlePreview());
  },

  _drawPanel() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = `
      <div class="table-container">
        <div class="table-toolbar">
          <span class="table-toolbar__title">📧 邮件通知</span>
          <span class="table-toolbar__count">${this._subCount} 位订阅者</span>
        </div>

        <!-- Tabs -->
        <div class="notif-tabs">
          <button class="notif-tab ${this._tab === 'compose' ? 'notif-tab--active' : ''}" data-tab="compose">✏️ 撰写通知</button>
          <button class="notif-tab ${this._tab === 'log' ? 'notif-tab--active' : ''}" data-tab="log">📋 发送记录</button>
          <button class="notif-tab ${this._tab === 'subscribers' ? 'notif-tab--active' : ''}" data-tab="subscribers">👥 订阅者列表</button>
        </div>

        ${this._tab === 'compose' ? this._renderCompose() : ''}
        ${this._tab === 'log' ? this._renderLog() : ''}
        ${this._tab === 'subscribers' ? this._renderSubscribers() : ''}
      </div>
    `;

    this.bindEvents();
    if (this._tab === 'subscribers') this._loadSubscribers();
  },

  _renderCompose() {
    return `
      <div style="padding:24px;">
        <div class="form-row">
          <label class="form-label">📌 邮件主题 <span style="color:var(--primary)">*</span></label>
          <input type="text" id="notif-subject" class="form-input" placeholder="例如：本周新书上架！海贼王108卷到货 📚">
        </div>
        <div class="form-row">
          <label class="form-label">📝 邮件内容 <span style="color:var(--primary)">*</span></label>
          <textarea id="notif-body" class="form-textarea" rows="12"
            placeholder="输入邮件内容...&#10;&#10;支持的格式：&#10;• 纯文本 + 换行&#10;• 简单 HTML：<b>粗体</b> <i>斜体</i> <br> 换行 <a href='...'>链接</a>&#10;&#10;邮件会自动包装为品牌模板发送。"></textarea>
        </div>

        <div class="notif-actions">
          <button class="btn btn--outline" id="btn-preview-notif">👁️ 预览</button>
          <button class="btn btn--primary" id="btn-send-notif" ${this._subCount === 0 ? 'disabled' : ''}>
            🚀 发送给 ${this._subCount} 位订阅者
          </button>
        </div>

        <div id="notif-preview" class="notif-preview" style="display:none;"></div>

        <div class="notif-info">
          <p>💡 <strong>发送流程：</strong>点击发送后，邮件会进入发送队列。系统每隔 5 分钟自动发送队列中的邮件（通过 Gmail SMTP）。</p>
          <p>📊 <strong>发送限制：</strong>Gmail 每日上限 500 封。如果有超过 500 位订阅者，邮件会分批在数天内发送。</p>
        </div>
      </div>
    `;
  },

  _renderLog() {
    const logs = this._recentLogs || [];
    return `
      <div style="padding:24px;">
        ${logs.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无发送记录</p>
          </div>
        ` : `
          <table class="admin-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>类型</th>
                <th>收件人</th>
                <th>主题</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td>${new Date(log.created_at).toLocaleString('zh-MY')}</td>
                  <td><span class="notif-badge notif-badge--${log.type}">${this._typeLabel(log.type)}</span></td>
                  <td>${log.recipient_email}</td>
                  <td>${log.subject}</td>
                  <td><span class="notif-status notif-status--${log.status}">${this._statusLabel(log.status)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  },

  _renderSubscribers() {
    return `
      <div style="padding:24px;">
        <div id="subscriber-list">
          <div class="admin-spinner">⏳ 加载订阅者…</div>
        </div>
      </div>
    `;
  },

  async _loadSubscribers() {
    const list = document.getElementById('subscriber-list');
    if (!list) return;

    if (typeof EmailModule === 'undefined') {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>邮件模块未加载</p></div>';
      return;
    }

    const subs = await EmailModule.getSubscribers(false);
    if (!subs.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>暂无订阅者</p></div>';
      return;
    }

    list.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>电子邮箱</th>
            <th>姓名</th>
            <th>订阅时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${subs.map(s => `
            <tr>
              <td>${s.email}</td>
              <td>${s.name || '-'}</td>
              <td>${new Date(s.created_at).toLocaleString('zh-MY')}</td>
              <td><span class="notif-status notif-status--${s.is_active ? 'sent' : 'failed'}">${s.is_active ? '✅ 活跃' : '❌ 取消'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="notif-info" style="margin-top:16px;">
        <p>📊 总计 <strong>${subs.filter(s => s.is_active).length}</strong> 位活跃订阅者</p>
      </div>
    `;
  },

  async _handleSend() {
    const subject = document.getElementById('notif-subject')?.value.trim();
    const body = document.getElementById('notif-body')?.value.trim();

    if (!subject) { Utils.toast('请输入邮件主题', 'error'); return; }
    if (!body) { Utils.toast('请输入邮件内容', 'error'); return; }

    const btn = document.getElementById('btn-send-notif');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在加入发送队列…'; }

    const result = await EmailModule.sendBulk(subject, body);

    if (btn) { btn.disabled = false; btn.textContent = `🚀 发送给 ${this._subCount} 位订阅者`; }

    if (result.ok) {
      Utils.toast(`✅ 已加入发送队列！${result.queued}/${result.total} 封邮件待发送。`, 'success');
      // Switch to log tab
      this._recentLogs = await EmailModule.getLogs(10);
    } else {
      Utils.toast(`❌ ${result.error}`, 'error');
    }
  },

  _handlePreview() {
    const subject = document.getElementById('notif-subject')?.value.trim();
    const body = document.getElementById('notif-body')?.value.trim();
    const preview = document.getElementById('notif-preview');
    if (!preview) return;

    if (!subject && !body) {
      preview.style.display = 'none';
      return;
    }

    preview.style.display = 'block';
    preview.innerHTML = `
      <h4 style="margin-bottom:12px;">👁️ 邮件预览</h4>
      <div class="notif-preview-card">
        <div class="notif-preview__subject">${subject || '(无主题)'}</div>
        <div class="notif-preview__body">${body.replace(/\n/g, '<br>')}</div>
        <div class="notif-preview__footer">— 金牌漫画 UndisputedComics</div>
      </div>
    `;
  },

  _typeLabel(type) {
    const map = { welcome: '🎉 欢迎', order: '📦 订单', shipped: '🚚 发货', bulk: '📢 群发', manual: '✏️ 手动' };
    return map[type] || type;
  },

  _statusLabel(status) {
    const map = { pending: '⏳ 队列中', sent: '✅ 已发送', failed: '❌ 失败' };
    return map[status] || status;
  },
};
