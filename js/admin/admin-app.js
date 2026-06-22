/**
 * admin-app.js — Admin SPA Router
 * Handles auth check, routing, sidebar, mobile menu
 */
const AdminRouter = {
  _currentRoute: 'dashboard',

  async init() {
    // Check Supabase auth
    const isAdmin = await AdminAuth.checkAuth();

    if (!isAdmin) {
      // Show login form
      document.getElementById('admin-auth-wall').style.display = 'flex';
      document.getElementById('admin-layout').style.display = 'none';
      this._bindLogin();
      return;
    }

    // Show admin layout
    document.getElementById('admin-auth-wall').style.display = 'none';
    document.getElementById('admin-layout').style.display = 'flex';
    document.getElementById('admin-user-display').textContent =
      AdminAuth.getUser()?.email?.split('@')[0] || 'Admin';

    // Handle hash routing
    this._bindSidebar();
    this._handleHash();

    window.addEventListener('hashchange', () => this._handleHash());
  },

  _bindLogin() {
    document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;
      const errorEl = document.getElementById('admin-login-error');

      if (!email || !password) {
        errorEl.textContent = '请输入邮箱和密码';
        errorEl.style.display = 'block';
        return;
      }

      const loginBtn = document.querySelector('#admin-login-form button[type="submit"]');
      loginBtn.disabled = true;
      loginBtn.textContent = '登录中…';

      const result = await AdminAuth.login(email, password);

      if (result.ok) {
        errorEl.style.display = 'none';
        // Reload to show admin layout
        location.reload();
      } else {
        errorEl.textContent = result.error;
        errorEl.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = '登入控制台';
      }
    });
  },

  _bindSidebar() {
    // Sidebar navigation
    document.querySelectorAll('.admin-nav__item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.dataset.route;
        if (route) this.navigate(route);

        // Close mobile sidebar
        document.querySelector('.admin-sidebar')?.classList.remove('open');
      });
    });

    // Mobile menu toggle
    document.getElementById('admin-menu-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent .admin-main click from immediately closing
      document.querySelector('.admin-sidebar')?.classList.toggle('open');
    });

    // Close sidebar when clicking main content (but not the hamburger)
    document.querySelector('.admin-main')?.addEventListener('click', () => {
      document.querySelector('.admin-sidebar')?.classList.remove('open');
    });

    // Logout
    document.getElementById('admin-logout')?.addEventListener('click', async () => {
      if (confirm('确定要退出管理控制台吗？')) {
        await AdminAuth.logout();
        location.reload();
      }
    });
  },

  _handleHash() {
    const hash = location.hash.replace('#', '') || 'dashboard';
    const [route, paramStr] = hash.split('?');

    // Parse query params
    const params = {};
    if (paramStr) {
      paramStr.split('&').forEach(p => {
        const [k, v] = p.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    this.navigate(route, params);
  },

  /**
   * Navigate to a route and render the page
   */
  navigate(route, params) {
    this._currentRoute = route;

    // Update URL hash
    let hash = route;
    if (params && Object.keys(params).length) {
      const q = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      hash += '?' + q;
    }
    if (location.hash !== '#' + hash) {
      history.replaceState(null, '', '#' + hash);
    }

    // Update active sidebar item
    document.querySelectorAll('.admin-nav__item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === route);
    });

    // Update page title
    const titles = {
      dashboard: '控制台',
      products: '商品管理',
      orders: '订单管理',
      media: '媒体库',
      settings: '设置',
    };
    const titleEl = document.getElementById('admin-page-title');
    if (titleEl) titleEl.textContent = titles[route] || route;

    // Render page
    switch (route) {
      case 'dashboard':
        AdminDashboard.render();
        break;
      case 'products':
        AdminProducts.render(params);
        break;
      case 'orders':
        AdminOrders.render();
        break;
      case 'media':
        AdminMedia.render();
        break;
      case 'settings':
        AdminSettings.render();
        break;
      default:
        AdminDashboard.render();
    }
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => AdminRouter.init());
