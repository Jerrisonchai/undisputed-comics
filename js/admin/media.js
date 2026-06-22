/**
 * media.js — Admin Media Library
 * Upload images to Supabase Storage, browse, copy URLs
 */
const AdminMedia = {
  _files: [],
  _bucket: 'media',

  async render() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = '<div class="admin-spinner">⏳ 加载媒体库…</div>';
    await this._fetchFiles();
    this._draw();
  },

  async _fetchFiles() {
    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        const { data, error } = await sb.storage.from(this._bucket).list('', {
          sortBy: { column: 'created_at', order: 'desc' },
        });
        if (data) {
          this._files = data.filter(f => !f.name.startsWith('.'));
          return;
        }
      }
    } catch (err) { console.error('Fetch media:', err); }
    this._files = [];
  },

  _getPublicUrl(filename) {
    const config = typeof Config !== 'undefined' ? Config : { SUPABASE_URL: 'https://fdusyudelkhoomakdfel.supabase.co' };
    return `${config.SUPABASE_URL}/storage/v1/object/public/${this._bucket}/${filename}`;
  },

  _draw() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];

    content.innerHTML = `
      <div class="table-container">
        <div class="table-toolbar">
          <span class="table-toolbar__title">🖼️ 媒体库 (${this._files.length})</span>
          <div class="table-toolbar__actions">
            <button class="btn btn--primary btn--sm" id="btn-upload-media">📤 上传图片</button>
          </div>
        </div>

        <!-- Upload Drop Zone -->
        <div id="upload-dropzone" style="display:none;margin:16px;border:2px dashed #cbd5e0;border-radius:12px;padding:32px;text-align:center;background:#f7fafc;transition:all 0.3s;">
          <div style="font-size:40px;margin-bottom:8px;">📁</div>
          <p style="font-size:14px;color:#4a5568;margin-bottom:4px;">拖放图片到此处，或点击选择</p>
          <p style="font-size:12px;color:#a0aec0;">支持 JPG、PNG、GIF、WebP、SVG（最大 5MB）</p>
          <input type="file" id="media-file-input" accept="image/*" multiple style="display:none;">
          <div id="upload-preview" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:16px;"></div>
          <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
            <button class="btn btn--primary btn--sm" id="btn-confirm-upload" disabled>✅ 确认上传</button>
            <button class="btn btn--secondary btn--sm" id="btn-cancel-upload">取消</button>
          </div>
        </div>

        <!-- Media Grid -->
        <div style="padding:16px;">
          ${this._files.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state__icon">🖼️</div>
              <div class="empty-state__text">还没有上传任何图片</div>
              <button class="btn btn--primary btn--sm" id="btn-empty-upload">上传第一张图片</button>
            </div>
          ` : `
            <div class="media-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">
              ${this._files.map(f => {
                const url = this._getPublicUrl(f.name);
                const isImg = imageExts.some(ext => f.name.toLowerCase().endsWith(ext));
                const sizeKB = f.metadata?.size ? (f.metadata.size / 1024).toFixed(0) + 'KB' : '';
                return `
                  <div class="media-card" style="background:#fff;border:1px solid var(--admin-border);border-radius:10px;overflow:hidden;transition:all 0.2s;">
                    <div style="position:relative;aspect-ratio:3/4;background:#f7fafc;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                      ${isImg ? `<img src="${url}" alt="${this._esc(f.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">` : `<span style="font-size:32px;">📄</span>`}
                    </div>
                    <div style="padding:8px;">
                      <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this._esc(f.name)}">${this._esc(f.name)}</div>
                      <div style="font-size:11px;color:#a0aec0;margin-bottom:6px;">${sizeKB}</div>
                      <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button class="btn btn--secondary btn--xs btn-copy-url" data-url="${url}">📋 复制链接</button>
                        <button class="btn btn--danger btn--xs btn-delete-media" data-filename="${this._esc(f.name)}">🗑️</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    this._bindEvents();
  },

  _bindEvents() {
    const fileInput = document.getElementById('media-file-input');
    const dropzone = document.getElementById('upload-dropzone');
    const preview = document.getElementById('upload-preview');
    const confirmBtn = document.getElementById('btn-confirm-upload');

    // Open upload zone
    const openUpload = () => {
      dropzone.style.display = 'block';
      preview.innerHTML = '';
      confirmBtn.disabled = true;
      fileInput.value = '';
    };

    document.getElementById('btn-upload-media')?.addEventListener('click', openUpload);
    document.getElementById('btn-empty-upload')?.addEventListener('click', openUpload);

    // Click to select files
    dropzone?.addEventListener('click', (e) => {
      if (e.target === confirmBtn || e.target === document.getElementById('btn-cancel-upload')) return;
      fileInput.click();
    });

    // Drag & drop
    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--admin-sidebar-active)';
      dropzone.style.background = '#fff5f5';
    });
    dropzone?.addEventListener('dragleave', () => {
      dropzone.style.borderColor = '#cbd5e0';
      dropzone.style.background = '#f7fafc';
    });
    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#cbd5e0';
      dropzone.style.background = '#f7fafc';
      this._handleFiles(e.dataTransfer.files);
    });

    fileInput?.addEventListener('change', (e) => {
      this._handleFiles(e.target.files);
    });

    // Cancel upload
    document.getElementById('btn-cancel-upload')?.addEventListener('click', () => {
      dropzone.style.display = 'none';
      fileInput.value = '';
      preview.innerHTML = '';
    });

    // Confirm upload
    confirmBtn?.addEventListener('click', async () => {
      const files = fileInput.files;
      if (!files?.length) return;
      await this._uploadFiles(files);
    });

    // Copy URL
    document.querySelectorAll('.btn-copy-url').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.url).then(() => {
          AdminAuth.toast('✅ 链接已复制', 'success');
        }).catch(() => {
          AdminAuth.toast('复制失败，请手动选择', 'error');
        });
      });
    });

    // Delete media
    document.querySelectorAll('.btn-delete-media').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`确定要删除 "${btn.dataset.filename}" 吗？`)) return;
        await this._deleteFile(btn.dataset.filename);
      });
    });
  },

  _handleFiles(fileList) {
    const preview = document.getElementById('upload-preview');
    const confirmBtn = document.getElementById('btn-confirm-upload');
    if (!preview || !confirmBtn) return;

    const files = Array.from(fileList).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);

    if (files.length === 0) {
      AdminAuth.toast('请选择图片文件（最大 5MB）', 'error');
      return;
    }

    preview.innerHTML = files.map((f, i) => {
      const url = URL.createObjectURL(f);
      const sizeKB = (f.size / 1024).toFixed(0) + 'KB';
      return `
        <div style="text-align:center;">
          <img src="${url}" alt="${f.name}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;border:2px solid var(--admin-border);">
          <div style="font-size:11px;color:#718096;margin-top:4px;">${sizeKB}</div>
        </div>`;
    }).join('');

    confirmBtn.disabled = false;
  },

  async _uploadFiles(fileList) {
    const sb = AdminAuth._getClient();
    if (!sb) {
      AdminAuth.toast('Supabase 未连接', 'error');
      return;
    }

    const dropzone = document.getElementById('upload-dropzone');
    const total = fileList.length;
    let success = 0;

    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      // Sanitize filename: replace spaces and special chars
      const name = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

      AdminAuth.toast(`上传中… (${i + 1}/${total})`, 'info');

      const { error } = await sb.storage.from(this._bucket).upload(name, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        AdminAuth.toast(`上传失败: ${file.name} - ${error.message}`, 'error');
      } else {
        success++;
      }
    }

    if (success > 0) {
      AdminAuth.toast(`✅ 已上传 ${success}/${total} 个文件`, 'success');
    }

    // Reset & refresh
    dropzone.style.display = 'none';
    document.getElementById('media-file-input').value = '';
    document.getElementById('upload-preview').innerHTML = '';
    await this._fetchFiles();
    this._draw();
  },

  async _deleteFile(filename) {
    try {
      const sb = AdminAuth._getClient();
      if (sb) {
        const { error } = await sb.storage.from(this._bucket).remove([filename]);
        if (error) throw error;
      }
      AdminAuth.toast('🗑️ 已删除', 'success');
      await this._fetchFiles();
      this._draw();
    } catch (err) {
      AdminAuth.toast('删除失败: ' + (err.message || '未知错误'), 'error');
    }
  },

  _esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  },
};
