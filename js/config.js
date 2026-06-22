/**
 * config.js — App Configuration
 * UndisputedComics (金牌漫画) v1.0
 * Supabase keys loaded here. Feature flags. Site settings fallback.
 */

window.AppConfig = {
  // Supabase (Phase 5)
  supabaseUrl: 'https://fdusyudelkhoomakdfel.supabase.co',
  supabaseKey: 'sb_publishable_hMpj6OKgcZno6jUBEm4xSg_lRDVe9Vf',

  // Site config — defaults, overridden by Supabase site_settings later
  store: {
    name_zh: '金牌漫画',
    name_en: 'UndisputedComics',
    tagline: '品质漫画，金牌之选',
    phone: '+6012-3456789',
    shippingFlatWest: 8.00,
    shippingFlatEast: 15.00,
    shippingFreeMin: 150.00,
  },

  // Feature toggles
  features: {
    coupons: false,
    points: false,
  },

  // Routes
  routes: ['home', 'products', 'product', 'search', 'publisher', 'cart', 'account', 'login', 'register', 'checkout'],
  defaultRoute: 'home',

  // API endpoints (for Phase 8 email)
  api: {},

  // Version bump for cache busting
  version: '2.6.0',
};
