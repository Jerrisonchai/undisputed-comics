/**
 * products-manage.js — Admin Product CRUD
 * Table view, add/edit/delete, Supabase as primary
 */
const AdminProducts = {
  _products: [],
  _categories: [],

  async render(params) {
    const content = document.getElementById('admin-content');
    if (!content) return;

    if (params?.action === 'add' || params?.action === 'edit') {
      return this._renderForm(params.action === 'edit' ? params.id : null);
    }

    content.innerHTML = '<div class="admin-spinner">⏳ 加载商品…</div>';
    await this._fetchProducts();
    this._drawTable();
  },

  async _fetchProducts() {
    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        const { data } = await sb.from('products').select('*').order('sort_order');
        if (data?.length) { this._products = data; return; }
      }
    } catch (err) { console.error('Fetch products:', err); }

    // Fallback
    try {
      const res = await fetch('data/products.json');
      const data = await res.json();
      this._products = data.products || [];
    } catch { this._products = []; }
  },

  _drawTable() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const stockLabels = { in_stock: '有货', limited: '限量', out_of_stock: '缺货', pre_order: '预订' };

    content.innerHTML = `
      <div class="table-container">
        <div class="table-toolbar">
          <span class="table-toolbar__title">📚 商品管理 (${this._products.length})</span>
          <div class="table-toolbar__actions">
            <input class="table-search" type="text" id="product-search" placeholder="搜索商品…">
            <button class="btn btn--primary btn--sm" id="btn-add-product">➕ 新增商品</button>
          </div>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>价格</th>
                <th>分类</th>
                <th>库存</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="products-tbody">
              ${this._products.map(p => `
                <tr data-product-id="${p.id}" data-title="${(p.title_zh || '').toLowerCase()}">
                  <td>
                    <strong>${this._esc(p.title_zh)}</strong>
                    ${p.title_en ? `<br><small style="color:#718096;">${this._esc(p.title_en)}</small>` : ''}
                  </td>
                  <td>RM ${(p.price || 0).toFixed(2)}</td>
                  <td>${this._esc(p.category_id || '-')}</td>
                  <td><span class="status-badge status-badge--${p.stock_status}">${stockLabels[p.stock_status] || p.stock_status}</span></td>
                  <td>${p.sort_order || 0}</td>
                  <td>
                    <label class="toggle-switch" title="上下架">
                      <input type="checkbox" ${p.is_active !== false ? 'checked' : ''} class="toggle-active" data-product-id="${p.id}">
                      <span class="toggle-switch__slider"></span>
                    </label>
                  </td>
                  <td style="display:flex;gap:6px;">
                    <button class="btn btn--secondary btn--xs btn-edit" data-product-id="${p.id}">✏️</button>
                    <button class="btn btn--danger btn--xs btn-delete" data-product-id="${p.id}">🗑️</button>
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

  _bindTableEvents() {
    // Search
    document.getElementById('product-search')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#products-tbody tr').forEach(tr => {
        tr.style.display = tr.dataset.title?.includes(q) ? '' : 'none';
      });
    });

    // Add
    document.getElementById('btn-add-product')?.addEventListener('click', () => {
      this._renderForm(null);
    });

    // Edit
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        this._renderForm(btn.dataset.productId);
      });
    });

    // Delete
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`确定要删除 "${btn.dataset.productId}" 吗？此操作不可撤销。`)) return;
        await this._delete(btn.dataset.productId);
      });
    });

    // Toggle active
    document.querySelectorAll('.toggle-active').forEach(toggle => {
      toggle.addEventListener('change', async () => {
        await this._toggleActive(toggle.dataset.productId, toggle.checked);
      });
    });
  },

  /**
   * Render add/edit form inside a modal
   */
  _renderForm(productId) {
    const product = productId ? this._products.find(p => p.id === productId) : null;
    const isEdit = !!product;
    const stockOptions = [
      { value: 'in_stock', label: '有货' },
      { value: 'limited', label: '限量' },
      { value: 'out_of_stock', label: '缺货' },
      { value: 'pre_order', label: '预订' },
    ];
    const catOptions = [
      { value: 'shonen', label: '少年漫画' },
      { value: 'shojo', label: '少女漫画' },
      { value: 'seinen', label: '青年漫画' },
      { value: 'classics', label: '经典收藏' },
      { value: 'new-releases', label: '熱門新作' },
    ];

    const modal = document.createElement('div');
    modal.id = 'product-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">${isEdit ? '✏️ 编辑商品' : '➕ 新增商品'}</h3>
          <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal__body">
          <form id="product-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="prod-id">ID</label>
                <input class="form-group__input" type="text" id="prod-id"
                       value="${isEdit ? this._esc(product.id) : ''}"
                       placeholder="one-piece-108" required ${isEdit ? 'disabled style="opacity:0.6;"' : ''}>
                <span class="form-group__help">英文+数字，如 one-piece-108</span>
              </div>
              <div class="form-group">
                <label class="form-group__label" for="prod-sort">排序</label>
                <input class="form-group__input" type="number" id="prod-sort"
                       value="${isEdit ? (product.sort_order || 0) : 0}" min="0">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="prod-title-zh">中文标题 *</label>
                <input class="form-group__input" type="text" id="prod-title-zh"
                       value="${isEdit ? this._esc(product.title_zh) : ''}" required>
              </div>
              <div class="form-group">
                <label class="form-group__label" for="prod-title-en">英文标题</label>
                <input class="form-group__input" type="text" id="prod-title-en"
                       value="${isEdit ? this._esc(product.title_en || '') : ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="prod-price">售价 (RM) *</label>
                <input class="form-group__input" type="number" id="prod-price"
                       value="${isEdit ? product.price : ''}" step="0.01" min="0" required>
              </div>
              <div class="form-group">
                <label class="form-group__label" for="prod-orig-price">原价 (RM)</label>
                <input class="form-group__input" type="number" id="prod-orig-price"
                       value="${isEdit ? (product.original_price || '') : ''}" step="0.01" min="0">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="prod-category">分类</label>
                <select class="form-group__select" id="prod-category">
                  ${catOptions.map(c => `<option value="${c.value}" ${isEdit && product.category_id === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-group__label" for="prod-stock">库存状态</label>
                <select class="form-group__select" id="prod-stock">
                  ${stockOptions.map(s => `<option value="${s.value}" ${isEdit && product.stock_status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label" for="prod-publisher">出版社</label>
                <input class="form-group__input" type="text" id="prod-publisher"
                       value="${isEdit ? this._esc(product.publisher || '') : ''}" placeholder="東立">
              </div>
              <div class="form-group">
                <label class="form-group__label" for="prod-cover">封面图片 URL</label>
                <div style="display:flex;gap:8px;">
                  <input class="form-group__input" type="text" id="prod-cover"
                         value="${isEdit ? this._esc(product.cover_image || '') : ''}" placeholder="https://…" style="flex:1;">
                  <button type="button" class="btn btn--secondary btn--sm" id="btn-pick-media">🖼️ 选择</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-group__label" for="prod-desc">描述</label>
              <textarea class="form-group__textarea" id="prod-desc" rows="3"
                        placeholder="简短描述这本书…">${isEdit ? this._esc(product.description_zh || '') : ''}</textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <input type="checkbox" id="prod-featured" ${isEdit && product.is_featured ? 'checked' : ''}> 推荐商品
                </label>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" id="prod-new" ${isEdit && product.is_new ? 'checked' : ''}> 标记为 NEW
                </label>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" id="prod-active" ${(!isEdit || product.is_active !== false) ? 'checked' : ''}> 上架
                </label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
          <button class="btn btn--primary" id="btn-save-product">${isEdit ? '保存更改' : '创建商品'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Save
    document.getElementById('btn-save-product').addEventListener('click', async () => {
      await this._save(isEdit ? product.id : null);
    });

    // Pick from media library
    document.getElementById('btn-pick-media')?.addEventListener('click', () => {
      this._openMediaPicker();
    });
  },

  async _save(existingId) {
    const data = {
      id: document.getElementById('prod-id').value.trim(),
      title_zh: document.getElementById('prod-title-zh').value.trim(),
      title_en: document.getElementById('prod-title-en').value.trim() || null,
      price: parseFloat(document.getElementById('prod-price').value) || 0,
      original_price: parseFloat(document.getElementById('prod-orig-price').value) || null,
      category_id: document.getElementById('prod-category').value,
      stock_status: document.getElementById('prod-stock').value,
      publisher: document.getElementById('prod-publisher').value.trim() || null,
      cover_image: document.getElementById('prod-cover').value.trim() || null,
      description_zh: document.getElementById('prod-desc').value.trim() || null,
      is_featured: document.getElementById('prod-featured').checked,
      is_new: document.getElementById('prod-new').checked,
      is_active: document.getElementById('prod-active').checked,
      sort_order: parseInt(document.getElementById('prod-sort').value) || 0,
    };

    if (!data.id || !data.title_zh) {
      AdminAuth.toast('ID 和中文标题为必填项', 'error');
      return;
    }

    if (!existingId && !/^[a-z0-9][-a-z0-9]*$/.test(data.id)) {
      AdminAuth.toast('ID 格式错误：只能使用英文小写、数字和横杠', 'error');
      return;
    }

    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        if (existingId) {
          const { error } = await sb.from('products').update(data).eq('id', existingId);
          if (error) throw error;
        } else {
          const { error } = await sb.from('products').insert(data);
          if (error) throw error;
        }
      } else {
        // LocalStorage fallback
        if (existingId) {
          const idx = this._products.findIndex(p => p.id === existingId);
          if (idx >= 0) this._products[idx] = { ...this._products[idx], ...data };
        } else {
          this._products.push(data);
        }
        // Save back to local products JSON wouldn't work in production, but keeps it working offline
      }

      AdminAuth.toast(existingId ? '✅ 商品已更新' : '✅ 商品已创建', 'success');
      document.getElementById('product-modal')?.remove();

      // Refresh list
      await this._fetchProducts();
      this._drawTable();
    } catch (err) {
      AdminAuth.toast('保存失败: ' + (err.message || '未知错误'), 'error');
      console.error('Save product:', err);
    }
  },

  async _delete(productId) {
    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        // Soft delete: set is_active to false
        const { error } = await sb.from('products').update({ is_active: false }).eq('id', productId);
        if (error) throw error;
      } else {
        const idx = this._products.findIndex(p => p.id === productId);
        if (idx >= 0) this._products[idx].is_active = false;
      }

      AdminAuth.toast('🗑️ 商品已下架（软删除）', 'success');
      await this._fetchProducts();
      this._drawTable();
    } catch (err) {
      AdminAuth.toast('删除失败: ' + (err.message || '未知错误'), 'error');
    }
  },

  async _toggleActive(productId, isActive) {
    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        await sb.from('products').update({ is_active: isActive }).eq('id', productId);
      } else {
        const p = this._products.find(p => p.id === productId);
        if (p) p.is_active = isActive;
      }
      AdminAuth.toast(isActive ? '✅ 已上架' : '⏸️ 已下架', 'success');
    } catch (err) {
      AdminAuth.toast('操作失败', 'error');
    }
  },

  /**
   * Open media picker modal to browse uploaded images
   */
  async _openMediaPicker() {
    const sb = AdminAuth._getClient();
    const config = typeof Config !== 'undefined' ? Config : { SUPABASE_URL: 'https://fdusyudelkhoomakdfel.supabase.co' };
    const bucket = 'media';
    let files = [];

    // Fetch files from Supabase Storage
    try {
      const { data } = await sb.storage.from(bucket).list('', {
        sortBy: { column: 'created_at', order: 'desc' },
      });
      files = (data || []).filter(f => !f.name.startsWith('.'));
    } catch {}

    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
    const isImage = (name) => imageExts.some(ext => name.toLowerCase().endsWith(ext));

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:720px;">
        <div class="modal__header">
          <h3 class="modal__title">🖼️ 选择封面图片</h3>
          <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal__body">
          ${files.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state__icon">📭</div>
              <div class="empty-state__text">媒体库为空。请先在「媒体库」页面上传图片。</div>
            </div>
          ` : `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">
              ${files.filter(f => isImage(f.name)).map(f => {
                const url = ${JSON.stringify(config.SUPABASE_URL)} + '/storage/v1/object/public/' + bucket + '/' + f.name;
                return `
                  <div class="media-pick-card" data-url="${url}" style="cursor:pointer;border:2px solid transparent;border-radius:10px;overflow:hidden;transition:all 0.2s;background:#f7fafc;" onmouseenter="this.style.borderColor='var(--admin-sidebar-active)'" onmouseleave="this.style.borderColor='transparent'">
                    <div style="aspect-ratio:3/4;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                      <img src="${url}" alt="${this._esc(f.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                    </div>
                    <div style="padding:6px;font-size:11px;color:#718096;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this._esc(f.name)}">${this._esc(f.name)}</div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Click to select
    modal.querySelectorAll('.media-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        const coverInput = document.getElementById('prod-cover');
        if (coverInput) {
          coverInput.value = card.dataset.url;
          AdminAuth.toast('✅ 封面 URL 已填入', 'success');
        }
        modal.remove();
      });
    });
  },

  _esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};
