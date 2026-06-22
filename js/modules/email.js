/**
 * email.js — Email notifications module
 * UndisputedComics (金牌漫画) v2.7 — Phase 6
 * 
 * Architecture: Browser saves to notification_logs (Supabase) → cron script sends
 * No SMTP credentials in client code.
 */
const EmailModule = {
  /**
   * Subscribe email to newsletter
   */
  async subscribe(email, name = '') {
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        const { error } = await API._client
          .from('subscribers')
          .upsert({ email, name, is_active: true }, { onConflict: 'email' });

        if (error) throw error;
        return { ok: true, message: '订阅成功！感谢您的关注。' };
      }
      // localStorage fallback
      Storage.set('uc_subscribe_email', email);
      return { ok: true, message: '订阅成功！感谢您的关注。' };
    } catch (err) {
      // Fallback to localStorage
      Storage.set('uc_subscribe_email', email);
      return { ok: true, message: '订阅成功！感谢您的关注。' };
    }
  },

  /**
   * Unsubscribe
   */
  async unsubscribe(email) {
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        await API._client
          .from('subscribers')
          .update({ is_active: false })
          .eq('email', email);
      }
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  /**
   * Queue a notification for sending (saved to notification_logs, picked up by cron)
   */
  async queueNotification({ type, recipient_email, recipient_name, subject, body_html, order_id }) {
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        const { error } = await API._client.from('notification_logs').insert({
          type: type || 'manual',
          recipient_email,
          recipient_name,
          subject,
          body_html,
          order_id: order_id || null,
          status: 'pending',
        });

        if (error) {
          console.error('Queue notification failed:', error);
          return { ok: false, error: error.message };
        }
        return { ok: true };
      }
      return { ok: false, error: 'API not ready' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  /**
   * Get notification log for admin panel
   */
  async getLogs(limit = 50) {
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        const { data, error } = await API._client
          .from('notification_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      }
    } catch (err) {
      console.error('Get notification logs:', err);
    }
    return [];
  },

  /**
   * Get subscriber list for admin panel
   */
  async getSubscribers(onlyActive = true) {
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        let query = API._client.from('subscribers').select('*').order('created_at', { ascending: false });
        if (onlyActive) query = query.eq('is_active', true);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }
    } catch (err) {
      console.error('Get subscribers:', err);
    }
    return [];
  },

  /**
   * Get subscriber count
   */
  async getSubscriberCount() {
    try {
      if (typeof API !== 'undefined' && API.isReady()) {
        const { count } = await API._client
          .from('subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        return count || 0;
      }
    } catch { /* ignore */ }
    return 0;
  },

  /**
   * Send a bulk notification to all active subscribers.
   * Creates a notification_log entry per subscriber so cron picks them up.
   */
  async sendBulk(subject, body_html) {
    const subscribers = await this.getSubscribers(true);
    if (!subscribers.length) return { ok: false, error: '没有活跃的订阅者。' };

    let queued = 0;
    for (const sub of subscribers) {
      const result = await this.queueNotification({
        type: 'bulk',
        recipient_email: sub.email,
        recipient_name: sub.name || '',
        subject,
        body_html,
      });
      if (result.ok) queued++;
    }

    return { ok: true, queued, total: subscribers.length };
  },
};
