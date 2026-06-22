/**
 * auth.js — User Authentication Module
 * UndisputedComics (金牌漫画) v2.3
 * Supabase Auth primary (Phase 5) + localStorage fallback.
 */

const AuthModule = {
  _user: null,

  /**
   * Initialize — restore session from Supabase or localStorage
   */
  async init() {
    // Try Supabase session first
    if (API.isReady()) {
      const session = await API.getSession();
      if (session?.user) {
        this._user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || '读者',
          phone: '',
          address: '',
        };
        // Fetch profile
        try {
          const { data: profile } = await API._client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile) {
            this._user.name = profile.name || this._user.name;
            this._user.phone = profile.phone || '';
            this._user.address = profile.address || '';
          }
        } catch {}
        Storage.set('user_session', this._user);
        window.dispatchEvent(new CustomEvent('user-changed'));
        return;
      }
    }

    // Fallback: localStorage session
    this._user = Storage.get('user_session', null);
  },

  /**
   * Register — Supabase Auth (with localStorage fallback)
   */
  async register(data) {
    if (!data.email || !data.password || !data.name) {
      return { ok: false, error: '请填写所有必填字段' };
    }
    if (!this._isValidEmail(data.email)) {
      return { ok: false, error: '请输入有效的电子邮件地址' };
    }
    if (data.password.length < 6) {
      return { ok: false, error: '密码至少需要6个字符' };
    }

    // Try Supabase
    if (API.isReady()) {
      const result = await API.signUp(data.email, data.password, data.name);
      if (result.ok) {
        this._setSession(result.user);
        // Create profile in Supabase
        try {
          await API._client.from('profiles').upsert({
            id: result.user.id,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
            updated_at: new Date().toISOString(),
          });
        } catch {}
        return { ok: true };
      }
      return result;
    }

    // Local fallback
    return this._registerLocal(data.email, data.password, data.name);
  },

  /**
   * Login — Supabase Auth (with localStorage fallback)
   */
  async login({ email, password }) {
    if (!email || !password) {
      return { ok: false, error: '请输入邮箱和密码' };
    }

    if (API.isReady()) {
      const result = await API.signIn(email, password);
      if (result.ok) {
        this._setSession(result.user);
        return { ok: true };
      }
      return result;
    }

    return this._loginLocal(email, password);
  },

  /**
   * Logout
   */
  async logout() {
    await API.signOut();
    this._user = null;
    Storage.remove('user_session');
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
   * Get user ID
   */
  getUserId() {
    return this._user?.id || null;
  },

  /**
   * Reset password (Supabase sends email, local does nothing for now)
   */
  async resetPassword(email) {
    if (API.isReady()) {
      const { error } = await API._client.auth.resetPasswordForEmail(email);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }
    return { ok: false, error: '请通过 Supabase 重置密码' };
  },

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    if (!this._user) return { ok: false, error: '请先登录' };

    // Try Supabase profile update
    await API.updateProfile(updates);

    // Update local user object
    if (updates.name) this._user.name = updates.name.trim();
    if (updates.phone !== undefined) this._user.phone = updates.phone;
    if (updates.address !== undefined) this._user.address = updates.address;
    Storage.set('user_session', this._user);

    // Also update localStorage users array for fallback
    const users = Storage.get('users', []);
    const idx = users.findIndex(u => u.email === this._user.email);
    if (idx !== -1) {
      if (updates.name) users[idx].name = updates.name.trim();
      if (updates.phone !== undefined) users[idx].phone = updates.phone;
      if (updates.address !== undefined) users[idx].address = updates.address;
      Storage.set('users', users);
    }

    return { ok: true };
  },

  /**
   * Get user orders
   */
  async getOrders() {
    if (!this._user) return [];
    if (API.isReady()) return API.fetchUserOrders(this._user.id);
    return OrdersModule.getUserHistory(this._user.id);
  },

  /* ── Private ── */

  _setSession(user) {
    this._user = user;
    Storage.set('user_session', user);
    window.dispatchEvent(new CustomEvent('user-changed'));
  },

  _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  _generateId() {
    return 'USR' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  /* ── Local fallback methods (called by API.js when Supabase is down) ── */

  _registerLocal(email, password, name) {
    const users = Storage.get('users', []);
    if (users.find(u => u.email === email)) {
      return { ok: false, error: '此电子邮箱已注册' };
    }
    const newUser = {
      id: this._generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: '',
      address: '',
      createdAt: Date.now(),
    };
    users.push(newUser);
    Storage.set('users', users);
    this._setSession({ id: newUser.id, email: newUser.email, name: newUser.name, phone: '', address: '' });
    return { ok: true };
  },

  _loginLocal(email, password) {
    const users = Storage.get('users', []);
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if (!user) return { ok: false, error: '账户不存在' };
    if (user.password !== password) return { ok: false, error: '密码错误' };
    this._setSession({ id: user.id, email: user.email, name: user.name, phone: user.phone || '', address: user.address || '' });
    return { ok: true };
  },
};
