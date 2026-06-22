# PRD.md — UndisputedComics (金牌漫画)

> **Product:** Professional e-commerce website for comic book store
> **Domain:** UndisputedComics / 金牌漫画
> **Version:** v1.0 — 10-Phase Build
> **Created:** 2026-06-22 | **Role:** Full PRD — Build & Ship

---

## 1. EXECUTIVE SUMMARY

### 1.1 What Is This?

UndisputedComics (金牌漫画) is a mobile-first e-commerce website for selling physical comic books to Malaysian Chinese readers aged 35–60. It replaces the client's Shopee store (`my.shp.ee/oowZtP6A`) with a professional, branded web presence that builds customer loyalty, captures marketing leads, and enables direct sales without platform fees.

### 1.2 Why Build This?

| Problem | Solution |
|---------|----------|
| Shopee takes 12-15% commission per sale | Direct sales = 0% platform fee |
| No brand identity on Shopee | Full custom branding "金牌漫画" |
| Can't collect customer emails on Shopee | Email subscription + marketing funnels |
| No analytics on Shopee | Admin dashboard with sales analytics |
| Shopee UX cluttered for older users | Simple, large-text, clean design |
| No loyalty program | Member points + coupons (toggleable) |

### 1.3 Success Criteria

- [ ] 50+ products listed within 1 week of launch
- [ ] < 3 second load time on 3G connection
- [ ] Works on phones with 512MB RAM
- [ ] Admin can add products without technical help
- [ ] Customers can browse, cart, and checkout independently
- [ ] Email subscription converts 5%+ of visitors

---

## 2. TARGET AUDIENCE

### 2.1 Primary: Comic Collectors (Age 35–60)

**Profile:**
- Malaysian Chinese, reads Chinese-language comics
- Collects physical comics as a hobby (not digital)
- Uses mid-range or older Android phones
- Prefers simple, familiar interfaces (Shopee-like)
- Values trust, reliability, clear pricing
- May have presbyopia — needs larger text
- WhatsApp is their primary messaging app
- May not be tech-savvy — needs clear CTAs

**Design Implications:**
- Minimum body text: **18px** (not 14-16px)
- Headings: **24-32px**
- High contrast (WCAG AA minimum)
- Touch targets: min **48×48px**
- No ambiguous icons — always paired with Chinese text
- Simple navigation, no hidden gestures
- Clear "Add to Cart" / "Buy Now" buttons

### 2.2 Secondary: Admin (Store Owner)

**Profile:**
- Manages inventory, pricing, promotions
- Needs simple product CRUD
- Wants to see sales data
- Non-technical — needs intuitive admin panel

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | Vanilla JavaScript (ES6+) | No framework bloat, fast on low-end phones |
| **CSS** | Custom CSS with CSS Variables | No preprocessor needed, themeable |
| **Backend** | Supabase (Free Tier) | Auth, PostgreSQL DB, file storage, real-time |
| **Hosting** | GitHub Pages | Free, fast CDN, custom domain |
| **Database** | Supabase PostgreSQL | 500MB free, row-level security |
| **Storage** | Supabase Storage | 1GB free for product images |
| **Auth** | Supabase Auth | Email/password + magic link |
| **Mobile App** | Capacitor (Phase 10) | PWA → APK pipeline |
| **Email** | Supabase Edge Functions / Resend | Transactional emails |

### 3.2 Supabase Free Tier Limits

| Resource | Limit | Sufficient? |
|----------|-------|-------------|
| Database | 500 MB | ✅ Comics DB is tiny |
| Auth Users | 50,000 MAU | ✅ Ample for niche store |
| Storage | 1 GB | ✅ ~2000 product images |
| Bandwidth | 2 GB/mo | ✅ Static assets on GH Pages |
| Edge Functions | 500K invocations | ✅ Email sending only |

### 3.3 Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                  GitHub Pages                     │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  index.html  │  │  admin.html (Admin SPA)   │  │
│  │  (Main SPA)  │  │                          │  │
│  │  Hash Router │  │  Product CRUD            │  │
│  │  Customer UI │  │  Order Management        │  │
│  │              │  │  Analytics Dashboard      │  │
│  └──────┬───────┘  └──────────┬───────────────┘  │
└─────────┼─────────────────────┼──────────────────┘
          │                     │
          │   Supabase JS SDK   │
          │                     │
┌─────────▼─────────────────────▼──────────────────┐
│                  Supabase                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   Auth   │  │ Postgres │  │   Storage     │  │
│  │  Admin   │  │ Products │  │ Comic Images  │  │
│  │Customer  │  │  Orders  │  │   Banners     │  │
│  │  RLS     │  │ Coupons  │  │   Avatars     │  │
│  └──────────┘  │  Points  │  └───────────────┘  │
│                │ Settings │                      │
│                └──────────┘                      │
└──────────────────────────────────────────────────┘
```

### 3.4 Folder Structure (~47 files)

```
undisputed-comics/
├── index.html                       # Main SPA entry (customer-facing)
├── admin.html                       # Admin SPA entry (separate security boundary)
├── manifest.json                    # PWA manifest
├── sw.js                            # Service Worker (offline cache)
├── PRD.md                           # This document
├── DESIGN.md                        # Design system, tokens, guidelines
├── README.md                        # Setup instructions
│
├── css/
│   ├── main.css                     # CSS variables, reset, typography, layout
│   ├── home.css                     # Homepage: hero, categories, featured
│   ├── products.css                 # Product grid, cards, filters, search
│   ├── cart.css                     # Cart, checkout
│   ├── auth.css                     # Login, register, account
│   ├── admin.css                    # Admin panel styles
│   └── components.css               # Shared: buttons, modals, badges, nav
│
├── js/
│   ├── app.js                       # App init, hash router, global state
│   ├── config.js                    # Supabase keys, site config, feature flags
│   ├── lib/
│   │   ├── storage.js               # localStorage wrapper with expiry
│   │   ├── utils.js                 # Format currency, dates, validators
│   │   └── api.js                   # All Supabase query functions
│   ├── modules/
│   │   ├── auth.js                  # Auth: login, register, logout, session
│   │   ├── nav.js                   # Top bar, bottom tabs, header rendering
│   │   ├── cart.js                  # Cart state, add/remove/update items
│   │   ├── products.js              # Product rendering helpers
│   │   ├── search.js                # Search logic (client-side + DB fallback)
│   │   ├── coupons.js               # Coupon validation & application
│   │   ├── points.js                # Member points earn/redeem logic
│   │   ├── email.js                 # Email subscription, notification triggers
│   │   └── orders.js               # Order creation, history
│   ├── pages/
│   │   ├── home.js                  # Homepage render + init
│   │   ├── products.js              # Product listing (grid, filters, sort)
│   │   ├── product-detail.js        # Single product view with gallery
│   │   ├── cart.js                  # Cart page render + interactions
│   │   ├── checkout.js              # Checkout flow (info → confirm → WhatsApp)
│   │   ├── login.js                 # Login/register page
│   │   ├── register.js              # Registration page
│   │   ├── account.js               # My account: orders, points, settings
│   │   └── search.js                # Search results page
│   └── admin/
│       ├── admin-app.js             # Admin init + router
│       ├── admin-auth.js            # Admin login (separate from customer)
│       ├── dashboard.js             # Analytics: sales, orders, customers
│       ├── products-manage.js       # Product CRUD (add/edit/delete)
│       ├── orders-manage.js         # Order list, status updates
│       ├── promotions.js            # Events, banners, featured products
│       ├── upload.js                # Image upload to Supabase storage
│       └── settings.js              # Feature toggles, site config
│
├── data/
│   ├── categories.json              # Static product categories
│   ├── publishers.json              # Known publisher list
│   ├── copywriting.json             # ALL Chinese text strings (centralized)
│   └── site-config.json             # Default site configuration
│
└── assets/
    └── images/
        ├── logo.png                 # 金牌漫画 logo (placeholder)
        ├── hero-bg.jpg             # Hero banner (free stock photo)
        ├── og-image.png            # Open Graph share image
        └── placeholder/
            ├── comic-cover.png      # Generic comic cover placeholder
            ├── banner-default.jpg   # Default banner
            └── avatar.png           # Default user avatar
```

**Total: ~47 files**

---

## 4. FEATURE LIST (by Phase)

### Phase 1: Foundation + Homepage
- [x] Project scaffolding, folder structure
- [ ] `index.html` with SPA shell (header, main content area, bottom nav)
- [ ] Hash-based router (`#home`, `#products`, `#cart`, `#account`, `#login`)
- [ ] CSS variables, typography (18px body, Chinese font stack)
- [ ] Bottom tab bar: Home | Categories | Cart | Account
- [ ] Homepage sections: Hero banner, Category chips, Featured Products, New Arrivals, Publisher grid
- [ ] Top bar: Logo, Search icon, Cart badge
- [ ] Footer: Store info, contact, social links
- [ ] Loading skeleton states for all product cards
- [ ] Placeholder logo, hero stock photo, comic placeholders

### Phase 2: Product Listing + Detail
- [ ] Product grid page with horizontal-scroll category filter
- [ ] Product card component: image, title, price, stock badge, publisher badge
- [ ] Sort: Newest, Price Low-High, Price High-Low, Popular
- [ ] Product detail page: image gallery, title, price, publisher, description, stock status
- [ ] "Add to Cart" button with quantity selector
- [ ] "Buy Now" button (jumps to checkout)
- [ ] Related products section
- [ ] Publisher page (filter by publisher)
- [ ] Search bar with autocomplete suggestions
- [ ] Search results page

### Phase 3: Cart + Checkout
- [ ] Cart page: item list, quantity adjuster, remove item, subtotal
- [ ] Cart badge (item count) on bottom nav
- [ ] Cart data persisted to localStorage + synced to Supabase (if logged in)
- [ ] Checkout flow (3-step):
  - Step 1: Contact info (name, phone, email optional)
  - Step 2: Order summary + coupon code input
  - Step 3: Confirmation → redirect to WhatsApp with formatted order text
- [ ] WhatsApp checkout: auto-format order details for admin
- [ ] Order saved to Supabase with status "pending"
- [ ] Order confirmation shown on screen

### Phase 4: Auth System
- [ ] Customer login (email + password via Supabase Auth)
- [ ] Customer registration (name, email, password)
- [ ] "Guest checkout" option (no login required to buy)
- [ ] Account page: order history, saved addresses
- [ ] Password reset flow
- [ ] Session persistence (stay logged in)
- [ ] Admin login (separate credentials, admin role in Supabase)

### Phase 5: Admin Panel
- [ ] Admin login page (separate SPA entry `admin.html`)
- [ ] Admin dashboard: total products, total orders, revenue (period selectors)
- [ ] Product management: table view, add new, edit, delete (soft delete)
- [ ] Product form: title (Chinese), price, publisher, category, stock status, description, cover image upload
- [ ] Image upload to Supabase Storage with compression
- [ ] Order management: list all orders, filter by status, update status (pending→confirmed→shipped→delivered)
- [ ] Order detail view: customer info, items, total

### Phase 6: Coupons + Discounts
- [ ] Admin: create coupon (code, type: % or fixed RM, value, min spend, expiry date, usage limit)
- [ ] Admin: coupon list, active/inactive toggle, delete
- [ ] Customer: apply coupon at checkout
- [ ] Coupon validation (expiry, min spend, usage count)
- [ ] Discount reflected in order total
- [ ] Feature toggle: Admin can DISABLE entire coupon system
- [ ] When disabled: coupon UI hidden from checkout, existing coupons preserved in DB

### Phase 7: Member Points System
- [ ] Earn points on purchase (configurable rate, e.g., 1 point per RM1)
- [ ] Points displayed in account page
- [ ] Redeem points at checkout (configurable rate, e.g., 100 points = RM1)
- [ ] Points history (earn/redeem log)
- [ ] Admin: configure earn rate, redeem rate, minimum points to redeem
- [ ] Feature toggle: Admin can DISABLE entire member points system
- [ ] When disabled: points UI hidden, existing points preserved in DB

### Phase 8: Email Subscriptions + Notifications
- [ ] Email signup form (homepage + checkout)
- [ ] Email stored in Supabase with "subscribed" status
- [ ] Admin: view subscriber list, export CSV
- [ ] Order confirmation email (auto-sent on order creation)
- [ ] Order status update email (shipped notification)
- [ ] New arrival notification (admin-triggered, sends to all subscribers)
- [ ] Unsubscribe link in every email
- [ ] Edge function for sending emails (Supabase + Resend free tier: 100 emails/day)

### Phase 9: Copywriting + UI Polish
- [ ] ALL Chinese copy centralized in `data/copywriting.json`
- [ ] Homepage tagline: audience-tested Chinese copy for comic collectors
- [ ] Product descriptions: guidelines for admin
- [ ] Call-to-action buttons: Chinese text optimized for conversion
- [ ] Trust signals: "安全支付" badges, SSL info, store info
- [ ] Accessibility audit: minimum 18px text, 48px touch targets, WCAG AA contrast
- [ ] Performance audit: <3s load on 3G, lazy loading images, code splitting
- [ ] Test on real low-end Android device
- [ ] Chinese-specific: proper font fallback (Noto Sans SC → Microsoft YaHei → system)
- [ ] Navigation labels in Chinese, no English

### Phase 10: PWA + Mobile APK + Final QC
- [ ] PWA manifest: installable on Android/iOS
- [ ] Service Worker: offline cache, network-first for HTML, cache-first for assets
- [ ] APK build via Capacitor (same pipeline as TripleTails/SugarSwipe)
- [ ] Deep link handling in APK
- [ ] Push notification placeholder (future enhancement)
- [ ] Final cross-browser testing (Chrome, Safari, Samsung Internet, UC Browser)
- [ ] Load testing (100+ concurrent users)
- [ ] SEO: meta tags, Open Graph, structured data (Product schema)
- [ ] Custom domain setup (undisputedcomics.com or similar)
- [ ] Admin training documentation (Chinese)

---

## 5. DATA MODELS (Supabase Tables)

### 5.1 `products`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| title_zh | text | Chinese product title |
| price | numeric(10,2) | Selling price in RM |
| original_price | numeric(10,2) | Original price (for strikethrough) |
| publisher | text | Publisher name |
| category_id | uuid (FK) | Category reference |
| stock_status | enum | 'in_stock', 'low_stock', 'out_of_stock', 'pre_order' |
| description_zh | text | Chinese product description |
| cover_image | text | Supabase Storage URL |
| images | text[] | Additional product images |
| is_featured | boolean | Show on homepage |
| is_active | boolean | Soft delete flag |
| sort_order | int | Manual ordering |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.2 `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| name_zh | text | Chinese category name |
| slug | text | URL-friendly |
| icon | text | Emoji or icon class |
| sort_order | int | |

### 5.3 `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | Nullable (guest checkout) |
| customer_name | text | |
| customer_phone | text | For WhatsApp |
| customer_email | text | Optional |
| status | enum | 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled' |
| subtotal | numeric(10,2) | |
| discount | numeric(10,2) | From coupon |
| points_redeemed | int | Points used |
| total | numeric(10,2) | Final amount |
| coupon_code | text | Applied coupon |
| notes | text | Customer notes |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.4 `order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| order_id | uuid (FK) | |
| product_id | uuid (FK) | |
| quantity | int | |
| price_at_time | numeric(10,2) | Price when ordered |

### 5.5 `coupons`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| code | text (UNIQUE) | Coupon code |
| type | enum | 'percentage', 'fixed' |
| value | numeric(10,2) | Discount value |
| min_spend | numeric(10,2) | Minimum order amount |
| max_uses | int | Total usage limit |
| used_count | int | Current usage count |
| is_active | boolean | |
| expires_at | timestamptz | |
| created_at | timestamptz | |

### 5.6 `member_points`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| points | int | Current balance |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.7 `points_transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| type | enum | 'earn', 'redeem' |
| points | int | Transaction amount |
| order_id | uuid (FK, nullable) | Linked order |
| description | text | |
| created_at | timestamptz | |

### 5.8 `subscribers`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| email | text (UNIQUE) | |
| name | text | Optional |
| is_active | boolean | Unsubscribed = false |
| created_at | timestamptz | |

### 5.9 `site_settings` (single-row table)
| Column | Type | Description |
|--------|------|-------------|
| store_name_zh | text | "金牌漫画" |
| store_name_en | text | "UndisputedComics" |
| logo_url | text | Store logo (placeholder → admin upload) |
| hero_banner_url | text | Hero banner image URL |
| hero_tagline_zh | text | Hero text (default: "品质漫画，金牌之选") |
| store_phone | text | WhatsApp contact for checkout |
| store_email | text | Contact + admin login email |
| shipping_flat_west | numeric(10,2) | Flat rate West Malaysia (default: 8.00) |
| shipping_flat_east | numeric(10,2) | Flat rate East Malaysia (default: 15.00) |
| shipping_free_min | numeric(10,2) | Free shipping above this amount (default: 150.00) |
| coupons_enabled | boolean | Toggle coupon system (default: false) |
| points_enabled | boolean | Toggle member points (default: false) |
| points_earn_rate | int | Points per RM1 spent (default: 1) |
| points_redeem_rate | int | Points per RM1 discount (default: 100) |
| min_points_redeem | int | Minimum points to redeem (default: 100) |

### 5.10 `promotions` (events, featured banners)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| title_zh | text | |
| image_url | text | |
| link_type | enum | 'product', 'category', 'external' |
| link_target | text | Product ID, category slug, or URL |
| is_active | boolean | |
| start_date | date | |
| end_date | date | |
| created_at | timestamptz | |

---

## 6. ROUTING (Hash-Based SPA)

| Route | Page | File |
|-------|------|------|
| `#home` | Homepage | `js/pages/home.js` |
| `#products` | Product listing | `js/pages/products.js` |
| `#products/:category` | Category filter | `js/pages/products.js` |
| `#product/:id` | Product detail | `js/pages/product-detail.js` |
| `#cart` | Shopping cart | `js/pages/cart.js` |
| `#checkout` | Checkout flow | `js/pages/checkout.js` |
| `#login` | Login/register | `js/pages/login.js` |
| `#account` | My account | `js/pages/account.js` |
| `#account/orders` | Order history | `js/pages/account.js` |
| `#account/points` | Points history | `js/pages/account.js` |
| `#search` | Search results | `js/pages/search.js` |
| `#search?q=term` | Search query | `js/pages/search.js` |
| `#publisher/:name` | Publisher page | `js/pages/products.js` |

**Admin Routes** (`admin.html`):
| Route | Page | File |
|-------|------|------|
| `#dashboard` | Analytics | `js/admin/dashboard.js` |
| `#products` | Product CRUD | `js/admin/products-manage.js` |
| `#orders` | Order management | `js/admin/orders-manage.js` |
| `#promotions` | Promotions/events | `js/admin/promotions.js` |
| `#settings` | Site settings | `js/admin/settings.js` |

---

## 7. CHECKOUT FLOW (WhatsApp Integration)

Instead of a payment gateway, orders are confirmed via WhatsApp:

```
1. Customer fills cart
2. Goes to Checkout
3. Enters: Name*, Phone*, Email (optional), Notes
4. Applies coupon (if available)
5. Sees order summary with total
6. Taps "Confirm Order via WhatsApp"
7. System generates formatted WhatsApp message:
   
   "🛒 *金牌漫画 订单*
   ────────────────
   商品：
   1. 《海賊王 108》 ×1  RM28.00
   2. 《鏈鋸人 23》 ×2  RM44.00
   ────────────────
   小计：RM72.00
   优惠券：WELCOME10 (-RM7.20)
   总计：*RM64.80*
   ────────────────
   姓名：Jerrison Chai
   电话：012-3456789
   备注：请包好，谢谢！"

8. WhatsApp opens with pre-filled message
9. Customer sends → Admin receives & processes
10. Order saved in Supabase with status 'pending'
```

**Why WhatsApp instead of payment gateway?**
- Zero transaction fees
- Target audience already uses WhatsApp daily
- Admin prefers personal touch with customers
- Can add Stripe/SenangPay later if needed
- Builds relationship (direct chat with each customer)

---

## 8. FEATURE TOGGLES

Admin can enable/disable these features from Settings:

| Feature | Default | When Disabled |
|---------|---------|---------------|
| Coupons | **OFF** | Hidden from checkout, codes not accepted |
| Member Points | **OFF** | Hidden from account, no earn/redeem |

Toggle settings stored in `site_settings` table. UI elements conditionally rendered based on flag.

**Rationale:** Store is launching with basic book sales. Coupons and points will be activated later as the business grows. Building them now means zero rework later.

---

## 9. SECURITY

### 9.1 Row-Level Security (Supabase)

- `products`: Anyone can read, only admin can write
- `orders`: Customers read own orders, admin reads all
- `coupons`: Anyone can validate, only admin can CRUD
- `subscribers`: Admin only
- `site_settings`: Admin only for write, public for read (limited fields)

### 9.2 Admin Security

- Admin auth via Supabase Auth with role claim
- Admin SPA on separate `admin.html` (reduces attack surface)
- Admin routes check auth state on every page load
- Session timeout: 24 hours
- Failed login rate limiting (Supabase built-in)

### 9.3 Data Validation

- All prices validated server-side (numeric, >= 0)
- Coupon codes sanitized (uppercase, alphanumeric only)
- Email addresses validated before storage
- File uploads: only images (jpg, png, webp), max 5MB, compressed client-side

---

## 10. PERFORMANCE TARGETS

| Metric | Target | Strategy |
|--------|--------|----------|
| First Load | < 3s (3G) | Minified inline CSS + deferred JS |
| Subsequent Loads | < 1s | Service Worker cache |
| Time to Interactive | < 4s | Async Supabase init |
| Product Images | < 100KB each | Compress before upload (admin tool) |
| Lighthouse Score | > 90 | Semantic HTML, alt text, proper headings |
| Offline | Viewable | SW caches static assets + last product list |

---

## 11. PHASE TIMELINE (Estimated)

| Phase | Content | Est. Files | Est. Time |
|-------|---------|-----------|-----------|
| 1 | Foundation + Homepage | 10 | 2 days |
| 2 | Products + Detail | 4 | 2 days |
| 3 | Cart + Checkout | 4 | 2 days |
| 4 | Auth System | 4 | 1.5 days |
| 5 | Admin Panel | 7 | 2 days |
| 6 | Coupons + Discounts | 3 | 1 day |
| 7 | Member Points | 3 | 1 day |
| 8 | Email + Notifications | 3 | 1.5 days |
| 9 | Copywriting + Polish | 2 | 1 day |
| 10 | PWA + APK + QC | 4 | 1.5 days |
| **Total** | | **~47** | **~15 days** |

---

## 12. CONFIRMED DECISIONS (2026-06-22)

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Supabase as backend** | Free tier (500MB DB, 1GB storage, 50K MAU). Auth + DB + Storage in one. |
| 2 | **WhatsApp checkout** | Zero transaction fees, audience already uses WhatsApp, personal touch. |
| 3 | **GitHub Pages subdomain first** | `jerrisonchai.github.io/undisputed-comics` — build mockups for friend review before buying custom domain. |
| 4 | **Placeholder logo → Admin upload** | AI-generated placeholder logo for MVP. Admin can upload/replace via Settings panel. Logo URL stored in `site_settings.logo_url`. |
| 5 | **10 seed products** | 5 categories × 2 products each. Hand-picked from Shopee store. See Section 14. |
| 6 | **Shipping: flat rate RM8** | Simple flat rate for West Malaysia. East Malaysia RM15. Free shipping above RM150. Configurable in admin settings. |
| 7 | **Return policy: none initially** | Not needed for MVP. Can add to checkout page later via admin settings. |
| 8 | **Analytics: Supabase only** | Supabase queries for sales data. No Google Analytics (privacy-first, no cookie banners needed). |
| 9 | **Mockups for friend review** | After Phase 1 (homepage skeleton + hero + styling), deploy to GitHub Pages so friend can see and approve before continuing. |
| 10 | **Design pivot: Bright Coral + Aurora Glassmorphism** | Original gold/navy palette replaced by vibrant coral pink (`#FF6B6B`) + purple (`#A78BFA`) + teal (`#4ECDC4`) + aurora blob background + frosted glass cards. Rationale: more energetic, distinctive, memorable brand feel that appeals beyond traditional "gold" luxury. |
| 11 | **Dark mode toggle (planned)** | CSS custom properties + `[data-theme="dark"]` selector. Toggle persists to localStorage, respects `prefers-color-scheme`. See Section 16 for full palette. |

---

## 13. OPEN QUESTIONS (remaining)

1. **WhatsApp number:** What's the admin's business WhatsApp for checkout redirect?
2. **Admin email:** What email for Supabase auth admin account? (jerrcoc1@gmail.com?)
3. **Custom domain:** `undisputedcomics.com` — confirm after mockup approved?
4. **Seed prices:** Confirm pricing for the 10 products below?

---

## 14. SEED PRODUCT CATALOG

10 products across 5 categories for MVP launch. Admin replaces these via Admin Panel after go-live.

### Category 1: 少年漫画 (Shonen)

| # | Product (Chinese) | English | Publisher | Price (RM) | Stock |
|---|-------------------|---------|-----------|------------|-------|
| 1 | 海賊王 第108卷 | One Piece Vol. 108 | 東立 | 28.00 | 现货 |
| 2 | 咒術迴戰 第23卷 | Jujutsu Kaisen Vol. 23 | 東立 | 26.00 | 现货 |

### Category 2: 少女漫画 (Shojo)

| # | Product (Chinese) | English | Publisher | Price (RM) | Stock |
|---|-------------------|---------|-----------|------------|-------|
| 3 | 晨曦公主 第38卷 | Yona of the Dawn Vol. 38 | 尖端 | 24.00 | 现货 |
| 4 | 魔法水果籃 第12卷 | Fruits Basket Vol. 12 | 東立 | 22.00 | 限量 |

### Category 3: 青年漫画 (Seinen)

| # | Product (Chinese) | English | Publisher | Price (RM) | Stock |
|---|-------------------|---------|-----------|------------|-------|
| 5 | 鏈鋸人 第23卷 | Chainsaw Man Vol. 23 | 東立 | 22.00 | 现货 |
| 6 | 怪物 完全版 第1卷 | Monster Complete Vol. 1 | 東販 | 35.00 | 預購 |

### Category 4: 经典收藏 (Classic Collection)

| # | Product (Chinese) | English | Publisher | Price (RM) | Stock |
|---|-------------------|---------|-----------|------------|-------|
| 7 | 七龍珠 完全版 第1卷 | Dragon Ball Complete Vol. 1 | 東立 | 38.00 | 现货 |
| 8 | 灌籃高手 新裝版 第1卷 | Slam Dunk New Edition Vol. 1 | 尖端 | 32.00 | 现货 |

### Category 5: 熱門新作 (Hot New Releases)

| # | Product (Chinese) | English | Publisher | Price (RM) | Stock |
|---|-------------------|---------|-----------|------------|-------|
| 9 | 間諜家家酒 第12卷 | Spy x Family Vol. 12 | 東立 | 24.00 | 现货 |
| 10 | 鬼滅之刃 第23卷 | Demon Slayer Vol. 23 | 東立 | 26.00 | 现货 |

### Category Definitions (seeded in `categories` table)

| Slug | Chinese Name | Icon |
|------|-------------|------|
| shonen | 少年漫画 | 🔥 |
| shojo | 少女漫画 | 🌸 |
| seinen | 青年漫画 | 🎯 |
| classics | 经典收藏 | 💎 |
| new-releases | 熱門新作 | 🆕 |

### Publishers (seeded in `publishers` table)

| Name | Slug |
|------|------|
| 東立 | tongli |
| 尖端 | sharp-point |
| 東販 | tongpan |

**⚠️ Confirm:** Prices and stock status are estimates — Jerrison to verify against actual Shopee store.

---

## 15. COMPETITIVE COMPARISON

| Feature | Shopee | Got1Shop (有店) | UndisputedComics |
|---------|--------|-----------------|------------------|
| Platform fee | 12-15% | Unknown | **0%** |
| Branding | None (Shopee UI) | Custom | **Full custom** |
| Customer emails | ❌ | ❌ | ✅ |
| Loyalty points | Shopee Coins | GotPoints | ✅ (toggleable) |
| Coupons | ✅ | ✅ | ✅ (toggleable) |
| Analytics | Basic | Unknown | ✅ |
| Admin control | Limited | Full | **Full** |
| WhatsApp checkout | ❌ | ❌ | ✅ |
| PWA/App | Shopee App | ❌ | ✅ (Phase 10) |
| Large text (50+) | ❌ | ❌ | ✅ |
| Chinese-only UI | Mixed | ✅ | ✅ |

---

## 16. DARK MODE

### 16.1 Toggle Strategy

```
System preference (prefers-color-scheme) → localStorage override → toggle button
```

1. **On first visit:** Respect `prefers-color-scheme: dark` media query
2. **User toggles:** Save preference to localStorage (`uc_theme: 'dark' | 'light'`)
3. **Toggle button:** Sun/Moon icon in top nav, toggles `[data-theme="dark"]` on `<html>`
4. **CSS:** All colors are CSS custom properties. `[data-theme="dark"]` overrides the palette.

### 16.2 Dark Mode Palette

| Token | Light (default) | Dark | Notes |
|-------|-----------------|------|-------|
| `--primary` | `#FF6B6B` | `#FF7B7B` | Slightly brighter for dark bg contrast |
| `--primary-hover` | `#FF5252` | `#FF9292` | |
| `--primary-light` | `#FFE0E0` | `rgba(255,107,107,0.12)` | Glass badge bg |
| `--primary-glow` | `rgba(255,107,107,0.25)` | `rgba(255,107,107,0.35)` | Stronger glow on dark |
| `--secondary` | `#A78BFA` | `#B794F4` | Slightly lifted for dark |
| `--secondary-light` | `#EDE9FE` | `rgba(167,139,250,0.12)` | |
| `--accent` | `#4ECDC4` | `#5EDCD4` | Brighter teal on dark |
| `--accent-light` | `#D1FAE5` | `rgba(78,205,196,0.12)` | |
| `--bg-primary` | `#FFF5F5` | `#0B0E14` | Deep charcoal-navy |
| `--bg-gradient` | pink→purple→mint | `#0B0E14 → #121620` | Subtle dark gradient |
| `--bg-card` | `rgba(255,255,255,0.72)` | `rgba(255,255,255,0.05)` | Frosted glass on dark |
| `--bg-card-hover` | `rgba(255,255,255,0.88)` | `rgba(255,255,255,0.08)` | |
| `--bg-glass` | `rgba(255,255,255,0.55)` | `rgba(255,255,255,0.06)` | |
| `--glass-bg-strong` | `rgba(255,255,255,0.85)` | `rgba(20,22,30,0.9)` | Top nav, bottom nav |
| `--text-primary` | `#2D3748` | `#E4E4EC` | Off-white (not pure white) |
| `--text-secondary` | `#718096` | `#9898B0` | Muted lavender-gray |
| `--text-disabled` | `#CBD5E0` | `#505066` | |
| `--border-light` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.08)` | |
| `--border-glass` | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.08)` | |
| `--divider` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.06)` | |
| `--shadow-card` | light pink shadow | `0 2px 16px rgba(0,0,0,0.3)` | Darker, deeper shadows |
| `--shadow-btn` | coral glow | `0 4px 16px rgba(255,107,107,0.35)` | |
| `--shadow-tab` | white glow | `0 -2px 24px rgba(0,0,0,0.4)` | |

### 16.3 Implementation

```css
/* In main.css — default = light */
:root { /* light palette as shown above */ }

[data-theme="dark"] {
  --primary: #FF7B7B;
  --primary-hover: #FF9292;
  --primary-light: rgba(255,107,107,0.12);
  --primary-glow: rgba(255,107,107,0.35);
  --secondary: #B794F4;
  --secondary-light: rgba(167,139,250,0.12);
  --accent: #5EDCD4;
  --accent-light: rgba(78,205,196,0.12);
  --bg-primary: #0B0E14;
  --bg-gradient: linear-gradient(135deg, #0B0E14 0%, #121620 50%, #0D1117 100%);
  --bg-card: rgba(255,255,255,0.05);
  --bg-card-hover: rgba(255,255,255,0.08);
  --bg-glass: rgba(255,255,255,0.06);
  --glass-bg-strong: rgba(20,22,30,0.9);
  --text-primary: #E4E4EC;
  --text-secondary: #9898B0;
  --text-disabled: #505066;
  --border-light: rgba(255,255,255,0.08);
  --border-glass: rgba(255,255,255,0.08);
  --divider: rgba(255,255,255,0.06);
  --shadow-card: 0 2px 16px rgba(0,0,0,0.3);
  --shadow-sm: 0 2px 12px rgba(255,107,107,0.15);
  --shadow-md: 0 4px 20px rgba(167,139,250,0.18);
  --shadow-btn: 0 4px 16px rgba(255,107,107,0.35);
  --shadow-tab: 0 -2px 24px rgba(0,0,0,0.4);
  --glass-bg: rgba(255,255,255,0.06);
  --glass-blur: blur(20px);
  --glass-border: 1px solid rgba(255,255,255,0.08);
}
```

### 16.4 Toggle Button (JS)

```js
const ThemeToggle = {
  init() {
    const saved = Storage.get('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this._renderButton();
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.set('theme', next === 'dark' ? 'dark' : 'light');
    this._renderButton();
  },

  _renderButton() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const btn = document.getElementById('btn-theme');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  },
};
```

### 16.5 Aurora Blobs in Dark Mode

Dark mode aurora blobs use deeper, richer tones with reduced opacity:
- Blob 1: `rgba(255,107,107,0.15)` (muted coral)
- Blob 2: `rgba(167,139,250,0.10)` (muted purple)
- Blob 3: `rgba(78,205,196,0.08)` (muted teal)
- Blob 4: `rgba(255,217,61,0.06)` (muted gold)

---

*EOF — v1.0 PRD | 47 files | 10 phases | Updated: Phase 3 complete, Dark Mode spec added*
