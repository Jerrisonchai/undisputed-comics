/**
 * theme.js — Dark/Light Mode Toggle
 * UndisputedComics (金牌漫画) v2.0
 * Respects system preference, persists to localStorage, toggles via button.
 * Prefixed under uc_theme to match Storage module conventions.
 */

const ThemeToggle = {
  /**
   * Initialize theme — apply saved or system preference, render button
   */
  init() {
    // Only use saved preference — default to light (no data-theme attribute)
    const saved = Storage.get('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (saved === 'light') {
      // Explicitly set light if user previously chose it
      document.documentElement.setAttribute('data-theme', 'light');
    }
    // No saved preference → no data-theme attribute → CSS defaults to light
    this._renderButton();
  },

  /**
   * Toggle between light and dark mode
   */
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.set('theme', next === 'dark' ? 'dark' : 'light');
    this._renderButton();
  },

  /**
   * Update toggle button icon
   */
  _renderButton() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const btn = document.getElementById('btn-theme');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  },
};
