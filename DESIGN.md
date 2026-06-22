# DESIGN.md — UndisputedComics (金牌漫画)

> **Design System v1.0** | 2026-06-22
> **Tone:** Professional, Trustworthy, Comic-Collector Friendly
> **Target:** Malaysian Chinese, Age 35-60, Physical Comic Buyers

---

## 1. DESIGN PHILOSOPHY

### 1.1 Core Principles

| Principle | Meaning |
|-----------|---------|
| **大而清 (Big & Clear)** | Everything is readable at arm's length. No squinting. |
| **信与安 (Trust & Safety)** | The design says "we're a real store, not a scam." Badges, clear pricing, store info always visible. |
| **简即雅 (Simple = Elegant)** | One action per screen. No clutter. Comic book shopping should feel like browsing a well-organized bookstore, not a flea market. |
| **金为魂 (Gold Soul)** | Subtle gold accents throughout — the "金牌" in 金牌漫画 is the brand DNA. Not gaudy; restrained and premium. |
| **触可及 (Thumb-Friendly)** | Every tappable element fits under an adult thumb. Bottom nav, large buttons. |

### 1.2 Visual Analogy

> Walking into a well-lit, organized comic book store. Warm lighting. Books displayed face-out so covers are visible. Owner greets you by name. Prices clearly marked. No hunting — everything has its place.

That's the feeling we're building digitally.

---

## 2. COLOR SYSTEM

### 2.1 Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--gold-primary` | `#C8962E` | Primary CTAs, price text, badges, active states |
| `--gold-light` | `#E8D5A3` | Subtle highlights, card borders on hover |
| `--gold-dark` | `#8B6914` | Text on gold backgrounds |
| `--red-accent` | `#C41E3A` | Sale badges, limited stock, urgency |
| `--red-light` | `#FDE8EC` | Sale badge background |
| `--navy-header` | `#1A1F36` | Top bar, bottom nav, section headers |
| `--navy-light` | `#2D3351` | Hover states on dark backgrounds |
| `--bg-warm` | `#FAF8F5` | Page background (warm paper feel) |
| `--bg-white` | `#FFFFFF` | Card backgrounds |
| `--text-primary` | `#1A1A1A` | Body text, product titles |
| `--text-secondary` | `#6B6B6B` | Publisher names, metadata, timestamps |
| `--text-disabled` | `#B0B0B0` | Disabled buttons, placeholder text |
| `--border-light` | `#E8E5E0` | Card borders, dividers |
| `--success-green` | `#2E7D32` | In-stock badge, success messages |
| `--success-bg` | `#E8F5E9` | Stock badge background |
| `--warning-orange` | `#E65100` | Low stock warning |

### 2.2 Color Usage Map

```
┌─────────────────────────────────────────┐
│ Top Nav Bar: --navy-header background   │
│ Logo: --gold-primary                    │
│ Search icon: --text-secondary           │
├─────────────────────────────────────────┤
│ Page BG: --bg-warm                      │
│                                         │
│ ┌── Card ──────────────────────────┐   │
│ │ bg: --bg-white                    │   │
│ │ border: --border-light            │   │
│ │ shadow: 0 2px 8px rgba(0,0,0,.08) │   │
│ │                                   │   │
│ │ ┌──────┐                         │   │
│ │ │ IMAGE│  Title: --text-primary   │   │
│ │ │      │  Publisher: --text-2nd   │   │
│ │ └──────┘  Price: --gold-primary   │   │
│ │  [现货]   Badge: --success-green  │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Bottom Nav: --navy-header bg            │
│ Active tab: --gold-primary              │
│ Cart badge: --red-accent                │
└─────────────────────────────────────────┘
```

---

## 3. TYPOGRAPHY

### 3.1 Font Stack

```css
/* Chinese + Latin font stack */
--font-body: 'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', 
             'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;

/* Display / headings */
--font-display: 'Noto Serif SC', 'SimSun', 'STSong', serif;
```

**Fallback strategy:**
1. Noto Sans SC (Google Fonts, subset to Chinese Simplified) — primary
2. Microsoft YaHei (Windows built-in) — fallback
3. PingFang SC (macOS/iOS built-in) — fallback
4. System sans-serif — final fallback

### 3.2 Type Scale (Mobile-First, Age-Friendly)

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 14px | 400 | 1.4 | Badge labels, fine print only |
| `--text-sm` | 16px | 400 | 1.5 | Publisher names, timestamps |
| `--text-base` | **18px** | 400 | 1.6 | Body text, descriptions, form labels |
| `--text-lg` | 20px | 500 | 1.5 | Card titles, price display |
| `--text-xl` | 24px | 700 | 1.4 | Section headers |
| `--text-2xl` | 28px | 700 | 1.3 | Page titles |
| `--text-3xl` | 32px | 700 | 1.2 | Hero tagline |
| `--text-4xl` | 40px | 800 | 1.1 | Logo, brand moments |

**Critical:** Minimum body text is 18px — NOT 16px. This is non-negotiable for the 35-60 target audience. The entire UI scales up from this base.

### 3.3 Chinese Typography Rules

- **No italic** for Chinese text (Chinese characters don't have true italics)
- **Line height 1.6+** for body text (Chinese characters are denser than Latin)
- **Text alignment:** Left-aligned for body (not justified — creates rivers in Chinese)
- **No ALL CAPS** for Chinese headings (Chinese has no case — use font-weight instead)
- **Punctuation:** Use full-width Chinese punctuation （，。！？） not half-width (, . ! ?)

---

## 4. SPACING SYSTEM

Based on 8px grid, but scaled for larger text:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Icon-text gap |
| `--space-sm` | 8px | Tight padding, badge padding |
| `--space-md` | 16px | Standard padding, card padding |
| `--space-lg` | 24px | Section gaps, page margins |
| `--space-xl` | 32px | Section padding |
| `--space-2xl` | 48px | Hero padding, major sections |

---

## 5. COMPONENT LIBRARY

### 5.1 Product Card (Horizontal Layout → for scrolling rows)

```
┌──────────────────────┐
│                      │
│   ┌──────────────┐   │
│   │              │   │  ← Comic cover image (3:4 aspect ratio)
│   │   COVER      │   │     Width: 140px, Height: 187px
│   │   IMAGE      │   │     Border-radius: 8px
│   │              │   │     Object-fit: cover
│   └──────────────┘   │
│                      │
│  [现货]  [東立]       │  ← Badge row (stock + publisher)
│  海賊王 第108卷       │  ← Title: --text-lg, --text-primary, bold
│  RM 28.00            │  ← Price: --text-lg, --gold-primary, 700 weight
│                      │
│  [+ 购物车]           │  ← Add to cart button (--gold-primary bg)
└──────────────────────┘

Card width: 160px (fixed for horizontal scroll)
Card bg: --bg-white
Card radius: 12px
Card shadow: 0 2px 8px rgba(0,0,0,0.06)
```

### 5.2 Product Card (Grid Layout → for product listing page)

```
┌──────────┬──────────┐
│          │          │
│ ┌──────┐ │ ┌──────┐ │  ← 2-column grid
│ │COVER │ │ │COVER │ │     50% width each (minus gap)
│ │      │ │ │      │ │     Image: full card width, 3:4 ratio
│ └──────┘ │ └──────┘ │
│          │          │
│  书名... │  书名... │  ← Title: 18px, max 2 lines, ellipsis
│  RM xx   │  RM xx   │  ← Price: 20px, gold
│  [现货]  │  [預購]  │  ← Badge
│          │          │
└──────────┴──────────┘
```

### 5.3 Featured Product Card (Hero-sized, for homepage spotlight)

```
┌─────────────────────────────────────┐
│ ┌─────────┐                         │
│ │         │  本周推荐                │  ← Section label
│ │  COVER  │  海賊王 第108卷          │  ← Title: 24px, bold
│ │         │  東立出版社              │
│ │         │  RM 28.00               │  ← Price: 24px, gold
│ │         │                         │
│ │         │  路飞一行人终于抵达...    │  ← Description: 18px, 3 lines max
│ │         │                         │
│ │         │  [立即购买] [加入购物车]  │  ← Dual CTA
│ └─────────┘                         │
└─────────────────────────────────────┘

Layout: CSS Grid — image (40%) + content (60%)
Border: 1px solid --border-light + gold left border (4px)
```

### 5.4 Bottom Tab Bar

```
┌──────────┬──────────┬──────────┬──────────┐
│  🏠      │  📂      │  🛒      │  👤      │
│  首页    │  分类     │  购物车  │  我的     │  ← Text + Icon
│          │          │    (3)   │          │  ← Cart badge on icon
└──────────┴──────────┴──────────┴──────────┘

Height: 64px
Background: --navy-header
Active: Icon + text in --gold-primary
Inactive: Icon + text in rgba(255,255,255,0.6)
Font size: 14px (smaller for nav labels — icons carry meaning)
Cart badge: --red-accent circle, white number, 20×20px
Safe area: padding-bottom respects device home indicator
```

### 5.5 Top Navigation Bar

```
┌──────────────────────────────────────┐
│  ≡  金牌漫画          🔍   🛒(3)     │  ← Hamburguer(admin) | Logo | Search | Cart
└──────────────────────────────────────┘

Height: 56px
Background: --navy-header
Logo: 24px, --gold-primary, bold
Icons: 24×24px, white
```

### 5.6 Category Chips (Horizontal Scroll)

```
┌──────────────────────────────────────────────┐
│ ← Scroll →                                    │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│ │ 全部   │ │少年漫画│ │少女漫画│ │青年漫画│ │
│ │  ✓     │ │        │ │        │ │        │ │  ← Active: gold bg + white text
│ └────────┘ └────────┘ └────────┘ └────────┘ │
└──────────────────────────────────────────────┘

Chip bg (inactive): --bg-white, border: --border-light
Chip bg (active): --gold-primary, text: white
Chip padding: 10px 20px
Chip radius: 24px (pill shape)
Font: 16px, 500 weight
Scroll: overflow-x auto, hide scrollbar, smooth snap
```

### 5.7 Buttons

```
Primary (CTA):
┌──────────────────────┐
│     加入购物车        │  ← Gold bg, white text, 48px height
└──────────────────────┘     border-radius: 12px, font: 18px/700
                              box-shadow: 0 4px 12px rgba(200,150,46,0.3)

Secondary (Outline):
┌──────────────────────┐
│     查看详情          │  ← Transparent bg, gold border, gold text
└──────────────────────┘

Danger (Remove, Cancel):
┌──────────────────────┐
│     删除              │  ← --red-accent bg, white text
└──────────────────────┘

Small (Filters, Chips):
┌──────────┐
│  最新上架 │  ← 40px height, 16px font
└──────────┘

Minimum tap target: 48×48px (WCAG 2.5.5)
```

### 5.8 Badges

```
现货:  Green bg + green text    → In stock
預購:  Blue bg + blue text      → Pre-order
限量:  Orange bg + orange text  → Limited stock
售完:  Gray bg + gray text      → Sold out
优惠:  Red bg + white text      → On sale
新品:  Gold bg + dark text      → New arrival
瑕疵:  Red bg + white text      → Defect/damaged (if applicable)

Badge style:
- Padding: 4px 10px
- Border-radius: 6px
- Font: 14px, 500 weight
- Display: inline-flex, gap: 4px from other badges
```

### 5.9 Search Bar

```
┌──────────────────────────────────┐
│  🔍  搜索漫画、出版社...          │  ← Placeholder in Chinese
└──────────────────────────────────┘

Height: 48px
Background: --bg-white
Border: 1px solid --border-light
Border-radius: 24px (pill)
Font: 18px
Icon: 20px, left padding 16px
Focus: border --gold-primary, subtle gold glow (box-shadow)
```

### 5.10 Quantity Selector

```
┌───┬─────┬───┐
│ − │  2  │ + │  ← Minus | Count | Plus
└───┴─────┴───┘

Buttons: 44×44px, --bg-white, border --border-light
Count: 44×44px, centered text, 20px font
Min disabled: opacity 0.4
Max: 99

### 5.11 Loading Skeleton (Product Cards)

```
┌──────────────────────┐
│ ████████████████████ │  ← Shimmer block (image placeholder)
│ ████████████████████ │     bg: linear-gradient shimmer animation
│                      │
│ ██████████           │  ← Shimmer (title)
│ ████████             │  ← Shimmer (publisher)
│ ██████████           │  ← Shimmer (price)
└──────────────────────┘

Shimmer: 200px wide, translucent, moves left→right over 1.5s
```

---

## 6. PAGE LAYOUTS

### 6.1 Homepage (`#home`)

```
┌────────────────────────────┐
│         TOP NAV BAR        │  ← Fixed top
├────────────────────────────┤
│                            │
│    ╔══════════════════╗    │  
│    ║   HERO BANNER    ║    │  ← Full-width, 280px height
│    ║  "品质漫画·金牌  ║    │     Dark overlay + white text
│    ║   之选"          ║    │     Gold CTA button
│    ║        [立即选购] ║    │
│    ╚══════════════════╝    │
│                            │
│  ← Category Chips →        │  ← Horizontal scroll
│                            │
│  📚 本周推荐 (Featured)    │  ← Section header (24px, bold)
│  ┌──────────────────────┐  │
│  │ Featured Product Card│  │  ← Larger card, horizontal layout
│  └──────────────────────┘  │
│                            │
│  🔥 热销排行 (Bestsellers) │  ← Section header
│  ┌──────┐ ┌──────┐ ┌────┐ │
│  │ #1   │ │ #2   │ │ #3 │ │  ← Horizontal scroll cards
│  └──────┘ └──────┘ └────┘ │
│                            │
│  🆕 最新上架 (New Arrivals)│  ← Section header
│  ┌──────┐ ┌──────┐ ┌────┐ │
│  │Card  │ │Card  │ │Card│ │  ← Horizontal scroll
│  └──────┘ └──────┘ └────┘ │
│                            │
│  🏢 出版社 (Publishers)    │  ← Section header
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │東│ │尖│ │青│ │角│    │  ← 4-column grid
│  │立│ │端│ │文│ │川│    │
│  └──┘ └──┘ └──┘ └──┘    │
│                            │
│  📧 订阅我们的通讯          │  ← Email signup
│  [_____________] [订阅]    │
│                            │
│  关于我们 | 联系方式 | ...   │  ← Footer
├────────────────────────────┤
│       BOTTOM TAB BAR       │  ← Fixed bottom
└────────────────────────────┘
```

### 6.2 Product Listing (`#products`)

```
┌────────────────────────────┐
│ ← 返回   漫画分类    🔍    │  ← Top bar with back + search
├────────────────────────────┤
│  ← Category Chips →        │
├────────────────────────────┤
│  排序: [最新▼] [价格▼]     │  ← Sort dropdowns
│         共 128 件商品       │  ← Result count
├────────────────────────────┤
│ ┌────────┬────────┐       │
│ │ Card   │ Card   │       │  ← 2-column grid
│ ├────────┼────────┤       │
│ │ Card   │ Card   │       │
│ ├────────┼────────┤       │
│ │ Card   │ Card   │       │
│ └────────┴────────┘       │
│                            │
│     [加载更多]              │  ← Load more button (or infinite scroll)
└────────────────────────────┘
```

### 6.3 Product Detail (`#product/:id`)

```
┌────────────────────────────┐
│ ← 返回               🛒(3)│  ← Top bar
├────────────────────────────┤
│                            │
│    ┌──────────────────┐    │
│    │                  │    │
│    │   COVER IMAGE    │    │  ← Full width, 3:4 ratio
│    │   (swipeable)    │    │     Swipe for more images
│    │                  │    │
│    │    ● ○ ○ ○       │    │  ← Dot indicators
│    └──────────────────┘    │
│                            │
│  [现货] [東立] [新品]      │  ← Badge row
│                            │
│  海賊王 第108卷            │  ← Title: 28px, bold
│  One Piece Vol. 108        │  ← Subtitle if available (smaller, gray)
│                            │
│  東立出版社                │  ← Publisher (tappable → publisher page)
│                            │
│  RM 28.00                  │  ← Price: 28px, --gold-primary, bold
│                            │
│  ─────────────────────     │  ← Divider
│                            │
│  商品描述                  │  ← Section title
│  路飞一行人终于抵达最终之岛│  ← Description: 18px, line-height 1.8
│  与四皇之一的黑胡子展开...  │     Expandable if long (3 lines → show more)
│                            │
│  ─────────────────────     │
│                            │
│  数量:  [− 1 +]            │  ← Quantity selector
│                            │
│  ┌──────────────────────┐  │
│  │     加入购物车        │  │  ← Primary CTA (full width)
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │     立即购买          │  │  ← Secondary CTA (gold outline)
│  └──────────────────────┘  │
│                            │
│  相关推荐                  │  ← Related products
│  ┌──────┐ ┌──────┐       │
│  │Card  │ │Card  │       │
│  └──────┘ └──────┘       │
└────────────────────────────┘
```

### 6.4 Cart (`#cart`)

```
┌────────────────────────────┐
│ ← 返回   购物车 (3件)      │  ← Top bar
├────────────────────────────┤
│                            │
│ ┌──────────────────────┐   │
│ │ ☐ ┌──────┐           │   │  ← Checkbox for select
│ │   │COVER │ 海賊王108 │   │
│ │   │      │ RM 28.00  │   │
│ │   └──────┘ [− 2 +]   │   │
│ │          🗑 删除       │   │
│ └──────────────────────┘   │
│                            │
│ ┌──────────────────────┐   │
│ │ ☐ ┌──────┐           │   │
│ │   │COVER │ 鏈鋸人 23 │   │
│ │   │      │ RM 22.00  │   │
│ │   └──────┘ [− 1 +]   │   │
│ └──────────────────────┘   │
│                            │
├────────────────────────────┤
│  📋 优惠码: [__________] → │  ← Coupon input (if enabled)
├────────────────────────────┤
│  小计 (2件):    RM 50.00   │  ← Summary
│  优惠:         −RM 5.00    │
│  积分抵扣:      −RM 2.00    │  ← If points enabled
│  ─────────────────────     │
│  总计:          RM 43.00   │  ← Total: bold, 24px, gold
│                            │
│  ┌──────────────────────┐  │
│  │     去结算 →          │  │  ← Checkout CTA
│  └──────────────────────┘  │
└────────────────────────────┘

Empty cart state:
  🛒 (large icon)
  购物车是空的
  [去逛逛]
```

### 6.5 Account Page (`#account`)

```
┌────────────────────────────┐
│ ← 返回   我的账户          │  ← Top bar
├────────────────────────────┤
│  ┌──────────────────────┐  │
│  │  👤  用户名           │  │  ← Profile card
│  │      email@test.com   │  │
│  │      [编辑资料]       │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 🛒  我的订单          →│  │  ← Tappable row
│  ├──────────────────────┤  │
│  │ 💎  我的积分  (120分) →│  │  ← If points enabled
│  ├──────────────────────┤  │
│  │ 🎫  我的优惠券       →│  │  ← If coupons enabled
│  ├──────────────────────┤  │
│  │ ⚙️  设置             →│  │
│  └──────────────────────┘  │
│                            │
│  [退出登录]                │
└────────────────────────────┘

Guest (not logged in):
  👤 登录以查看订单和积分
  [登录 / 注册]
```

### 6.6 Admin Dashboard (`admin.html#dashboard`)

```
┌────────────────────────────┐
│  金牌漫画 · 管理后台        │  ← Header
│  [产品] [订单] [促销] [设置]│  ← Admin nav tabs
├────────────────────────────┤
│  ┌──────┬──────┬──────┐   │
│  │ 总产品│ 总订单│ 总收入│   │  ← Stats cards (3-column)
│  │  128 │  45  │ 3,240│   │
│  │      │      │  RM  │   │
│  └──────┴──────┴──────┘   │
│                            │
│  📊 本周销售               │  ← Simple chart (bar or list)
│  ▓▓▓▓▓▓▓▓▓▓▓▓ 星期一  12  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 星期二 18 │
│  ▓▓▓▓▓▓▓▓▓▓ 星期三    8  │
│                            │
│  📋 最近订单               │  ← Recent orders table
│  ┌──────────────────────┐  │
│  │ #1001 张先生 RM43.00 →│  │
│  │ #1002 李先生 RM78.00 →│  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

---

## 7. RESPONSIVE BEHAVIOR

### 7.1 Breakpoints

| Breakpoint | Target | Layout |
|-----------|--------|--------|
| < 480px | Small phones | Single column, full-width cards |
| 480-768px | Large phones | 2-column grid, flexible cards |
| 768-1024px | Tablets | 3-column product grid, sidebar filters |
| > 1024px | Desktop | Max-width 1200px container, 4-column grid |

### 7.2 Mobile-First Approach

All base styles target < 480px. Media queries ADD layout for larger screens, never remove.

### 7.3 Touch Targets

- **Minimum:** 48×48px (WCAG 2.5.5 Level AAA)
- **Ideal:** 56×56px for primary CTAs
- **Spacing between tappable items:** Minimum 8px
- **Bottom nav items:** Full width ÷ 4, minimum 48px height + safe area

---

## 8. ANIMATIONS & MICRO-INTERACTIONS

### 8.1 Principles

- **Subtle, not distracting** — target audience doesn't want flashy animations
- **Purposeful** — every animation communicates something (feedback, loading, transition)
- **Reduced motion** — respect `prefers-reduced-motion` media query

### 8.2 Key Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade in + slide up 20px | 250ms | ease-out |
| Card hover/tap | Scale 0.97 on press | 150ms | ease-in-out |
| Add to cart | Button shrink → expand + badge bounce | 300ms | cubic-bezier |
| Cart badge | Scale bounce (1 → 1.3 → 1) | 300ms | spring |
| Loading skeleton | Shimmer sweep left→right | 1500ms | linear (infinite) |
| Modal open | Fade in overlay + scale card 0.95→1 | 200ms | ease-out |
| Toast notification | Slide in from top | 300ms | ease-out |
| Category chip select | BG color transition | 200ms | ease |

### 8.3 No Animation Elements

- **Text rendering** (causes jank on Chinese fonts)
- **Page scroll** (browser native is best)
- **Product images** (let them load, don't animate in)

---

## 9. ACCESSIBILITY

### 9.1 WCAG 2.1 AA Targets

| Check | Target | Implementation |
|-------|--------|---------------|
| Color contrast (text) | ≥ 4.5:1 | --text-primary on --bg-white = 17.5:1 ✅ |
| Color contrast (large text) | ≥ 3:1 | --gold-primary on --navy-header = 4.2:1 ✅ |
| Touch target size | ≥ 44×44px | All buttons ≥ 48×48px |
| Focus indicators | Visible | Gold outline on all focusable elements |
| Alt text | All images | Product images = product title |
| Heading hierarchy | Logical | H1 = page title, H2 = sections, H3 = sub-sections |
| Form labels | Always present | Every input has a visible label |
| Error messages | Descriptive | "请输入有效的电子邮箱" not "Invalid" |

### 9.2 Age-Specific Considerations

- **No tiny icons without labels** — every icon paired with Chinese text
- **No gesture-only interactions** — swipe is additive, not required
- **No auto-advancing carousels** — let users control pace
- **No time-limited actions** — no countdown timers, no "limited time offer" urgency tricks
- **Clear error recovery** — every action has an undo path

---

## 10. IMAGE GUIDELINES

### 10.1 Product Images

| Spec | Value |
|------|-------|
| Format | JPG (photos) or WebP (illustrations) |
| Aspect ratio | 3:4 (portrait, like a real comic) |
| Resolution | 600×800px (1x), 1200×1600px (2x) |
| Max file size | 200KB (compressed before upload) |
| Background | White or transparent |
| Content | Comic cover, front-facing, no glare |

### 10.2 Placeholder Images

All placeholder images follow the same specs but use:
- Gray background + gold "金牌漫画" watermark
- Comic-themed icon in center
- Stored in `assets/images/placeholder/`

### 10.3 Hero Banner

| Spec | Value |
|------|-------|
| Format | JPG |
| Dimensions | 750×420px (mobile), 1440×600px (desktop) |
| Max size | 150KB |
| Content | Dark-toned comic/manga theme stock photo + gold overlay text |
| Source | Free stock (Unsplash: "comic book", "manga shelf", "bookstore") |

---

## 11. ICONS

### 11.1 Icon Strategy

- Emoji for common icons (🎁🛒🏠📂👤🔍) — zero bytes, universally supported
- SVG for custom icons (logo mark, payment badges)
- No icon font libraries (reduce bundle size)

### 11.2 Emoji Map

| Icon | Emoji | Context |
|------|-------|---------|
| Home | 🏠 | Bottom nav |
| Categories | 📂 | Bottom nav |
| Cart | 🛒 | Bottom nav, top bar |
| Account | 👤 | Bottom nav |
| Search | 🔍 | Top bar, search input |
| Back | ← | Text arrow, no emoji needed |
| Delete | 🗑 | Cart item remove |
| Edit | ✏️ | Admin edit buttons |
| Add | ➕ | Admin add new product |
| Settings | ⚙️ | Account settings, admin |
| Orders | 📋 | Account order history |
| Points | 💎 | Member points |
| Coupon | 🎫 | Coupons |
| Email | 📧 | Email subscription |
| Stock | ✅ | In-stock badge |
| Preorder | 📦 | Pre-order badge |
| Limited | 🔥 | Limited stock badge |
| Sold out | ❌ | Out of stock |
| New | 🆕 | New arrival badge |
| Sale | 🏷️ | Sale/discount badge |
| WhatsApp | 💬 | Checkout |
| Success | ✅ | Confirmation |
| Error | ❌ | Error state |
| Empty | 📭 | Empty cart/orders |

---

## 12. CSS ARCHITECTURE

### 12.1 File Organization

```
css/
├── main.css        # Variables, reset, typography, layout utilities, global
├── home.css        # Hero, category chips, featured card, section styles
├── products.css    # Product grid, cards, filters, search results
├── cart.css        # Cart items, checkout form, order summary
├── auth.css        # Login/register forms, account page
├── admin.css       # Admin dashboard, tables, forms, upload
└── components.css  # Buttons, badges, modals, skeleton, nav bars
```

### 12.2 Naming Convention

BEM-like with component prefixes:
```css
.product-card { }           /* Block */
.product-card__image { }    /* Element */
.product-card--featured { } /* Modifier */
.product-card--loading { }  /* State */

.btn { }
.btn--primary { }
.btn--outline { }
.btn--danger { }
.btn--small { }
.btn--disabled { }

.badge { }
.badge--stock { }
.badge--preorder { }
.badge--soldout { }
```

### 12.3 CSS Variables (in `main.css`)

```css
:root {
  /* Colors */
  --gold-primary: #C8962E;
  --gold-light: #E8D5A3;
  --gold-dark: #8B6914;
  --red-accent: #C41E3A;
  --red-light: #FDE8EC;
  --navy-header: #1A1F36;
  --navy-light: #2D3351;
  --bg-warm: #FAF8F5;
  --bg-white: #FFFFFF;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --text-disabled: #B0B0B0;
  --border-light: #E8E5E0;
  --success-green: #2E7D32;
  --success-bg: #E8F5E9;
  
  /* Typography */
  --font-body: 'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  --font-display: 'Noto Serif SC', 'SimSun', serif;
  --text-xs: 14px;
  --text-sm: 16px;
  --text-base: 18px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 28px;
  --text-3xl: 32px;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* UI */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-elevated: 0 4px 16px rgba(0,0,0,0.12);
  --shadow-gold: 0 4px 12px rgba(200,150,46,0.3);
  
  /* Layout */
  --nav-top-height: 56px;
  --nav-bottom-height: 64px;
  --max-content-width: 1200px;
  --page-padding: 16px;
  
  /* Transition */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

---

## 13. COPYWRITING STYLE GUIDE (Chinese)

### 13.1 Brand Voice

| Tone | Example |
|------|---------|
| **Warm & welcoming** | "欢迎来到金牌漫画，找到你的下一本珍藏。" |
| **Expert & authoritative** | "我们精选每一本漫画，确保正版品质。" |
| **Simple & clear** | "加入购物车 → 结账 → 通过WhatsApp确认 → 发货" |
| **Respectful, not pushy** | "有兴趣吗？先收藏，慢慢看。" (never "马上购买，库存有限！") |

### 13.2 Key Phrases

| Context | Chinese | Notes |
|---------|---------|-------|
| Tagline | "品质漫画，金牌之选" | Quality comics, gold standard choice |
| CTA (primary) | "加入购物车" | Add to cart |
| CTA (buy) | "立即购买" | Buy now |
| CTA (checkout) | "去结算" | Go to checkout |
| CTA (confirm) | "通过WhatsApp确认订单" | Confirm via WhatsApp |
| Empty cart | "购物车是空的，去逛逛吧！" | Cart is empty, go browse! |
| New arrival | "最新上架" | New arrivals |
| Bestseller | "热销排行" | Bestseller ranking |
| Featured | "本周推荐" | Weekly pick |
| Publisher | "出版社" | Publisher |
| Subscribe | "订阅我们的通讯，获取最新上架通知" | Subscribe for new arrival alerts |
| Trust | "安全购物，品质保证" | Safe shopping, quality guaranteed |
| Out of stock | "暂时售完" | Temporarily sold out |
| Pre-order | "预订中" | Available for pre-order |

### 13.3 What to Avoid

- ❌ Aggressive urgency: "最后1件！" (Last 1! — feels scammy)
- ❌ Over-promising: "100%满意保证" (too strong for new store)
- ❌ Technical jargon: "SEO优化" / "转化率" (not customer-facing)
- ❌ English mixed with Chinese: "Checkout 现在" (pick one language)
- ✅ Gentle scarcity: "存货有限" (Limited stock — honest, not pushy)
- ✅ Simple guarantees: "正版保证" (Genuine product guarantee)

---

## 14. ADMIN PANEL DESIGN NOTES

### 14.1 Design Philosophy

Admin panel is **functional first, not pretty**. It's a tool for the store owner to get work done. No decorative elements. Every pixel serves a purpose.

### 14.2 Key Differences from Customer UI

| Element | Customer UI | Admin UI |
|---------|-------------|----------|
| Font size | 18px minimum | 16px (more data density needed) |
| Color | Gold accents, warm | Gold header only, neutral body |
| Layout | Scrollable cards | Table views, forms |
| Navigation | Bottom tabs | Top tabs |
| Loading | Skeleton cards | Simple spinners |

### 14.3 Settings Form Design (Logo + Site Config)

```
┌────────────────────────────────┐
│  商店设置                       │
│                                │
│  商店名称                       │
│  ┌──────────────────────────┐  │
│  │ 金牌漫画                   │  │
│  └──────────────────────────┘  │
│                                │
│  商店标志 (Logo)               │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │     [当前标志预览]        │  │  ← If logo_url exists
│  │                          │  │
│  │  📷 更换标志              │  │  ← Upload new logo
│  │  建议尺寸: 200×60px       │  │
│  └──────────────────────────┘  │
│                                │
│  Hero 标语                     │
│  ┌──────────────────────────┐  │
│  │ 品质漫画，金牌之选         │  │
│  └──────────────────────────┘  │
│                                │
│  WhatsApp 联系号码             │
│  ┌──────────────────────────┐  │
│  │ +6012-3456789            │  │
│  └──────────────────────────┘  │
│                                │
│  运费设置                       │
│  西马: RM [__]  东马: RM [__]  │
│  免运费最低消费: RM [____]     │
│                                │
│  ── 功能开关 ──                │
│  ☐ 启用优惠券系统               │
│  ☐ 启用会员积分                 │
│                                │
│  积分设置 (启用后显示)           │
│  每消费 RM1 获得: [__] 分      │
│  每 [__] 分可兑换 RM1           │
│  最低兑换积分: [____]           │
│                                │
│  [保存设置]                     │
└────────────────────────────────┘
```

### 14.4 Product Form Design

```
┌────────────────────────────────┐
│  添加新商品 / 编辑商品          │
│                                │
│  商品名称 (中文)*               │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                │
│  价格 (RM)*        原价 (可选) │
│  ┌──────────┐     ┌──────────┐ │
│  │          │     │          │ │
│  └──────────┘     └──────────┘ │
│                                │
│  出版社         分类           │
│  [选择▼]        [选择▼]       │
│                                │
│  库存状态                       │
│  ○ 现货  ○ 预售  ○ 售完       │
│                                │
│  商品描述 (中文)                │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                │
│  封面图片                       │
│  ┌──────────────────────────┐  │
│  │    📷 点击上传            │  │
│  │    或拖拽到此处           │  │
│  └──────────────────────────┘  │
│  ☐ 在首页展示                 │
│                                │
│  [保存]  [取消]               │
└────────────────────────────────┘
```

---

## 15. PERFORMANCE SPECS

### 15.1 Bundle Budget

| Resource | Max Size | Strategy |
|----------|----------|----------|
| HTML (initial) | 15 KB | Inline critical CSS + deferred everything |
| CSS (all files) | 30 KB | Minified, no preprocessor bloat |
| JS (all files) | 80 KB | Vanilla, no framework, ES6 modules |
| Supabase SDK | 60 KB | Loaded from CDN, cached |
| Fonts | 0 KB | System font stack only (no Google Fonts load) |
| Images (per page) | 500 KB | Lazy loaded, WebP where possible |
| **Total initial load** | **< 200 KB** | Under 3s on 3G |

### 15.2 Optimization Techniques

- No CSS framework (no Tailwind, no Bootstrap)
- No JS framework (no React, Vue, etc.)
- Supabase SDK loaded async from CDN
- Images: `<img loading="lazy">` + WebP format
- Service Worker caches all static assets
- CSS: single minified file per page (no @import)
- JS: `defer` on all script tags
- No Google Fonts — system fonts only
- No analytics/tracking scripts (privacy-first)

---

## 16. FILE BY PHASE (Build Order)

| Phase | Files Created |
|-------|--------------|
| **Phase 1** | `index.html`, `css/main.css`, `css/home.css`, `css/components.css`, `js/app.js`, `js/config.js`, `js/modules/nav.js`, `js/pages/home.js`, `data/categories.json`, `data/publishers.json`, `data/copywriting.json`, `data/site-config.json`, `assets/images/logo.png`, `assets/images/hero-bg.jpg`, `assets/images/placeholder/comic-cover.png` |
| **Phase 2** | `css/products.css`, `js/modules/products.js`, `js/modules/search.js`, `js/pages/products.js`, `js/pages/product-detail.js`, `js/pages/search.js` |
| **Phase 3** | `css/cart.css`, `js/modules/cart.js`, `js/modules/orders.js`, `js/pages/cart.js`, `js/pages/checkout.js` |
| **Phase 4** | `css/auth.css`, `js/lib/api.js`, `js/modules/auth.js`, `js/pages/login.js`, `js/pages/register.js`, `js/pages/account.js` |
| **Phase 5** | `admin.html`, `css/admin.css`, `js/admin/admin-app.js`, `js/admin/admin-auth.js`, `js/admin/dashboard.js`, `js/admin/products-manage.js`, `js/admin/orders-manage.js`, `js/admin/upload.js` |
| **Phase 6** | `js/modules/coupons.js`, `js/admin/promotions.js` |
| **Phase 7** | `js/modules/points.js` |
| **Phase 8** | `js/modules/email.js` |
| **Phase 9** | `data/copywriting.json` (full), `data/site-config.json` (update) |
| **Phase 10** | `manifest.json`, `sw.js`, `README.md` |

---

*EOF — DESIGN.md v1.0 | Ready for Build*
