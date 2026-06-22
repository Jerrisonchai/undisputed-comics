/**
 * auth.js — User Authentication Module
 * UndisputedComics (金牌漫画) v2.2
 * Handles login, register, logout, session persistence.
 * Uses localStorage (swappable to Supabase Auth in Phase 5).
 */

const AuthModule = {
  _user: null,

  /**
   * Initialize — restore session from localStorage
   */
  init() {
    this._user = Storage.get('user_session', null);
    this._updateNavUI();
  },

  /**
   * Register a new user
   * @param {Object} data — { name, email, password }
   * @returns {{ ok: boolean, error?: string }}
   */
  register(data) {
    if (!data.email || !data.password || !data.name) {
      return { ok: false, error: '请填写所有必填字段' };
    }
    if (!this._isValidEmail(data.email)) {
      return { ok: false, error: '请输入有效的电子邮件地址' };
    }
    if (data.password.length < 6) {
      return { ok: false, error: '密码至少需要6个字符' };
    }

    // Check existing users
    const users = Storage.get('users', []);
    const exists = users.find(u => u.email === data.email);
    if (exists) {
      return { ok: false, error: '此电子邮箱已注册' };
    }

    const newUser = {
      id: this._generateId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password, // In Phase 5: Supabase handles hashing
      phone: data.phone || '',
      address: data.address || '',
      createdAt: Date.now(),
    };

    users.push(newUser);
    Storage.set('users', users);

    // Auto-login after register
    this._setSession(newUser);
    return { ok: true };
  },

  /**
   * Login with email + password
   * @param {{ email: string, password: string }}
   * @returns {{ ok: boolean, error?: string }}
   */
  login({ email, password }) {
    if (!email || !password) {
      return { ok: false, error: '请输入邮箱和密码' };
    }

    const users = Storage.get('users', []);
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if (!user) {
      return { ok: false, error: '账户不存在' };
    }
    if (user.password !== password) {
      return { ok: false, error: '密码错误' };
    }

    this._setSession(user);
    return { ok: true };
  },

  /**
   * Logout
   */
  logout() {
    this._user = null;
    Storage.remove('user_session');
    this._updateNavUI();
    window.dispatchEvent(new CustomEvent('user-changed'));
    AppRouter.navigate('home');
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this._user;
  },

  /**
   * Get current user
   */
  getUser() {
    return this._user;
  },

  /**
   * Reset password
   * @param {string} email
   * @param {string} newPassword
   */
  resetPassword(email, newPassword) {
    const users = Storage.get('users', []);
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if (!user) {
      return { ok: false, error: '未找到此邮箱关联的账户' };
    }
    if (newPassword.length < 6) {
      return { ok: false, error: '新密码至少需要6个字符' };
    }
    user.password = newPassword;
    Storage.set('users', users);
    return { ok: true };
  },

  /**
   * Update user profile
   */
  updateProfile(updates) {
    if (!this._user) return { ok: false, error: '请先登录' };
    const users = Storage.get('users', []);
    const idx = users.findIndex(u => u.id === this._user.id);
    if (idx === -1) return { ok: false, error: '用户数据异常' };

    if (updates.name) users[idx].name = updates.name.trim();
    if (updates.phone !== undefined) users[idx].phone = updates.phone;
    if (updates.address !== undefined) users[idx].address = updates.address;

    Storage.set('users', users);
    this._user = users[idx];
    Storage.set('user_session', this._user);
    return { ok: true };
  },

  /**
   * Get all orders for current user (from localStorage)
   */
  getOrders() {
    if (!this._user) return [];
    return OrdersModule.getUserHistory(this._user.id);
  },

  /* ── Private ── */

  _setSession(user) {
    // Strip password from session
    const session = { ...user };
    delete session.password;
    this._user = session;
    Storage.set('user_session', session);
    this._updateNavUI();
    window.dispatchEvent(new CustomEvent('user-changed'));
  },

  _updateNavUI() {
    // Update account tab and top nav if logged in
    // Called after login/logout/init
    Nav.setActive(window.location.hash.slice(1) || 'home');
  },

  _generateId() {
    return 'USR' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
};
