/**
 * login.js — Login Page
 * UndisputedComics (金牌漫画) v2.2
 */
const PageLogin = {
  init() {
    // Redirect to account if already logged in
    if (AuthModule.isLoggedIn()) {
      AppRouter.navigate('account');
      return;
    }
    this._render();
  },

  bindEvents() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleLogin();
    });

    document.getElementById('btn-guest')?.addEventListener('click', () => {
      AppRouter.navigate('home');
    });

    document.getElementById('link-register')?.addEventListener('click', (e) => {
      e.preventDefault();
      AppRouter.navigate('register');
    });
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
    <div class="auth-page page">
      <div class="auth-card">
        <div class="auth-card__header">
          <span class="auth-card__icon">🏴‍☠️</span>
          <h1 class="auth-card__title">欢迎回来</h1>
          <p class="auth-card__subtitle">登录您的金牌漫画账户</p>
        </div>

        <div class="auth-alert" id="auth-alert"></div>

        <form class="auth-form" id="login-form" novalidate>
          <div class="form-group">
            <label class="form-group__label" for="login-email">电子邮箱</label>
            <input class="form-group__input"
                   type="email"
                   id="login-email"
                   placeholder="your@email.com"
                   autocomplete="email"
                   inputmode="email"
                   required>
            <span class="form-group__error" id="error-email"></span>
          </div>

          <div class="form-group">
            <label class="form-group__label" for="login-password">密码</label>
            <input class="form-group__input"
                   type="password"
                   id="login-password"
                   placeholder="输入密码"
                   autocomplete="current-password"
                   required>
            <span class="form-group__error" id="error-password"></span>
          </div>

          <button type="submit" class="btn btn--primary" id="btn-login-submit">
            登录
          </button>

          <button type="button" class="btn btn--outline" id="btn-guest">
            🛍️ 以游客身份浏览
          </button>
        </form>

        <div class="auth-link">
          还没有账户？<button id="link-register">立即注册</button>
        </div>
      </div>
    </div>`;
  },

  _handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const alertEl = document.getElementById('auth-alert');

    // Clear errors
    document.querySelectorAll('.form-group__error').forEach(el => el.textContent = '');
    alertEl.className = 'auth-alert';
    alertEl.textContent = '';

    const result = AuthModule.login({ email, password });
    if (!result.ok) {
      alertEl.className = 'auth-alert auth-alert--error';
      alertEl.textContent = result.error;
      return;
    }

    // Success — redirect to account
    AppRouter.navigate('account');
  }
};
