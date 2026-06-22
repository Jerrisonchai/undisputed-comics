/**
 * register.js — Registration Page
 * UndisputedComics (金牌漫画) v2.2
 */
const PageRegister = {
  init() {
    if (AuthModule.isLoggedIn()) {
      AppRouter.navigate('account');
      return;
    }
    this._render();
  },

  bindEvents() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleRegister();
    });

    document.getElementById('link-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      AppRouter.navigate('login');
    });
  },

  _render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
    <div class="auth-page page">
      <div class="auth-card">
        <div class="auth-card__header">
          <span class="auth-card__icon">📚</span>
          <h1 class="auth-card__title">创建账户</h1>
          <p class="auth-card__subtitle">加入金牌漫画，收藏您的最爱</p>
        </div>

        <div class="auth-alert" id="auth-alert"></div>

        <form class="auth-form" id="register-form" novalidate>
          <div class="form-group">
            <label class="form-group__label" for="reg-name">姓名</label>
            <input class="form-group__input"
                   type="text"
                   id="reg-name"
                   placeholder="您的名字"
                   autocomplete="name"
                   required>
            <span class="form-group__error" id="error-name"></span>
          </div>

          <div class="form-group">
            <label class="form-group__label" for="reg-email">电子邮箱</label>
            <input class="form-group__input"
                   type="email"
                   id="reg-email"
                   placeholder="your@email.com"
                   autocomplete="email"
                   inputmode="email"
                   required>
            <span class="form-group__error" id="error-email"></span>
          </div>

          <div class="form-group">
            <label class="form-group__label" for="reg-password">密码</label>
            <input class="form-group__input"
                   type="password"
                   id="reg-password"
                   placeholder="至少6个字符"
                   autocomplete="new-password"
                   required>
            <span class="form-group__error" id="error-password"></span>
          </div>

          <button type="submit" class="btn btn--primary" id="btn-register-submit">
            注册
          </button>
        </form>

        <div class="auth-link">
          已有账户？<button id="link-login">立即登录</button>
        </div>
      </div>
    </div>`;
  },

  async _handleRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const alertEl = document.getElementById('auth-alert');

    document.querySelectorAll('.form-group__error').forEach(el => el.textContent = '');
    alertEl.className = 'auth-alert';
    alertEl.textContent = '';

    // Client-side validation
    if (!name) {
      document.getElementById('error-name').textContent = '请输入姓名';
      return;
    }
    if (!email) {
      document.getElementById('error-email').textContent = '请输入电子邮箱';
      return;
    }
    if (!password) {
      document.getElementById('error-password').textContent = '请输入密码';
      return;
    }

    const result = await AuthModule.register({ name, email, password });
    if (!result.ok) {
      alertEl.className = 'auth-alert auth-alert--error';
      alertEl.textContent = result.error;
      return;
    }

    alertEl.className = 'auth-alert auth-alert--success';
    alertEl.textContent = '注册成功！正在跳转...';
    setTimeout(() => AppRouter.navigate('account'), 800);
  }
};
