/**
 * admin-auth.js — Admin Authentication
 * Uses Supabase Auth + profiles.role check
 */
const AdminAuth = {
  _user: null,
  _isAdmin: false,
  _supabase: null,

  /**
   * Initialize Supabase client (reuse API.js pattern)
   */
  _getClient() {
    if (this._supabase) return this._supabase;
    if (typeof supabase !== 'undefined') {
      const config = typeof Config !== 'undefined' ? Config : { SUPABASE_URL: 'https://fdusyudelkhoomakdfel.supabase.co', SUPABASE_PUBLIC_KEY: 'sb_publishable_hMpj6OKgcZno6jUBEm4xSg_lRDVe9Vf' };
      this._supabase = supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLIC_KEY);
    }
    return this._supabase;
  },

  /**
   * Check if already logged in as admin
   */
  async checkAuth() {
    const sb = this._getClient();
    if (!sb) return false;

    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return false;

      this._user = session.user;

      // Check admin role in profiles table (use maybeSingle to avoid error on empty)
      const { data: profile, error: profileErr } = await sb
        .from('profiles')
        .select('role')
        .eq('id', this._user.id)
        .maybeSingle();

      this._isAdmin = profile?.role === 'admin';

      // If profile doesn't exist yet, create it
      if (!profile) {
        const isAdmin = this._user.email === 'jerrcoc1@gmail.com'; // Auto-admin for your email
        const role = isAdmin ? 'admin' : 'customer';
        await sb.from('profiles').upsert({
          id: this._user.id,
          name: this._user.email?.split('@')[0] || '读者',
          email: this._user.email,
          role: role,
          updated_at: new Date().toISOString(),
        });
        this._isAdmin = isAdmin;
      }

      return this._isAdmin;
    } catch (err) {
      console.error('Admin auth check:', err);
      return false;
    }
  },

  /**
   * Login with email/password, verify admin role
   */
  async login(email, password) {
    const sb = this._getClient();
    if (!sb) return { ok: false, error: 'Supabase 未初始化' };

    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: this._translateError(error.message) };

      this._user = data.user;

      // Check role — auto-create profile if missing (same as checkAuth)
      const { data: profile, error: profileErr } = await sb
        .from('profiles')
        .select('role')
        .eq('id', this._user.id)
        .maybeSingle();

      let isAdmin = profile?.role === 'admin';

      // If profile doesn't exist, auto-create it for admin email
      if (!profile && !profileErr) {
        isAdmin = (this._user.email === 'jerrcoc1@gmail.com');
        const role = isAdmin ? 'admin' : 'customer';
        await sb.from('profiles').upsert({
          id: this._user.id,
          name: this._user.email?.split('@')[0] || '读者',
          email: this._user.email,
          role: role,
          updated_at: new Date().toISOString(),
        });
      }

      if (!isAdmin) {
        await sb.auth.signOut();
        this._user = null;
        return { ok: false, error: '无管理权限。仅限管理员登录。' };
      }

      this._isAdmin = true;
      return { ok: true, user: this._user };
    } catch (err) {
      console.error('Admin login error:', err);
      return { ok: false, error: '登录失败，请检查网络连接' };
    }
  },

  /**
   * Logout
   */
  async logout() {
    const sb = this._getClient();
    this._user = null;
    this._isAdmin = false;
    try { await sb?.auth.signOut(); } catch {}
  },

  /**
   * Get current admin user
   */
  getUser() { return this._user; },
  isAdmin() { return this._isAdmin; },

  /**
   * Translate Supabase auth errors to Chinese
   */
  _translateError(msg) {
    if (msg.includes('Invalid login credentials')) return '邮箱或密码错误';
    if (msg.includes('Email not confirmed')) return '邮箱未验证，请检查邮箱';
    if (msg.includes('rate limit')) return '登录尝试过多，请稍后再试';
    if (msg.includes('network')) return '网络连接失败';
    return msg;
  },

  /**
   * Show toast message
   */
  toast(msg, type = 'info') {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = `admin-toast admin-toast--${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
};
