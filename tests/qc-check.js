/**
 * QC Test Script — UndisputedComics Phase 3
 * Tests: homepage, add-to-cart, cart page, checkout flow, dark mode toggle
 * Output: screenshots saved to test-screenshots/
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://jerrisonchai.github.io/undisputed-comics';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const page = await context.newPage();
  const results = [];

  function test(name, pass, detail = '') {
    const icon = pass ? '✅' : '❌';
    console.log(`${icon} ${name}${detail ? ': ' + detail : ''}`);
    results.push({ name, pass, detail });
  }

  function log(msg) { console.log(`  📸 ${msg}`); }

  try {
    // ═══════════════════════════════════════════
    // TEST 1: Homepage loads
    // ═══════════════════════════════════════════
    log('Opening homepage...');
    await page.goto(BASE + '/#home', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('#top-nav', { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-homepage.png'), fullPage: true });

    const title = await page.title();
    test('Homepage title', title.includes('金牌漫画'), title);

    const topNav = await page.$('#top-nav');
    test('Top nav visible', !!topNav);

    const bottomNav = await page.$('#bottom-nav');
    test('Bottom nav visible', !!bottomNav);

    // Theme toggle button
    const themeBtn = await page.$('#btn-theme');
    test('Dark mode toggle button exists', !!themeBtn);
    if (themeBtn) {
      const themeIcon = await themeBtn.textContent();
      test('Theme button shows icon', themeIcon === '🌙' || themeIcon === '☀️', themeIcon);
    }

    // Search button
    const searchBtn = await page.$('#btn-search');
    test('Search button exists', !!searchBtn);

    // Cart button
    const cartTopBtn = await page.$('#btn-cart-top');
    test('Cart top button exists', !!cartTopBtn);

    // ═══════════════════════════════════════════
    // TEST 2: Navigate to Products
    // ═══════════════════════════════════════════
    log('Navigating to products...');
    await page.click('[data-route="products"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-products.png'), fullPage: true });

    const productCards = await page.$$('.product-card');
    test('Product grid has items', productCards.length > 0, `${productCards.length} products found`);

    // ═══════════════════════════════════════════
    // TEST 3: Add to cart from product detail
    // ═══════════════════════════════════════════
    if (productCards.length > 0) {
      log('Opening first product...');
      await productCards[0].click();
      await page.waitForTimeout(1500);

      const addToCartBtn = await page.$('.btn--primary');
      const hasAddBtn = addToCartBtn && (await addToCartBtn.textContent()).includes('加入购物车');
      test('Product detail has add-to-cart button', hasAddBtn);

      if (hasAddBtn) {
        log('Adding to cart...');
        await addToCartBtn.click();
        await page.waitForTimeout(1000);

        // Check toast
        const toast = await page.$('.toast');
        test('Toast shown after add', !!toast);
        if (toast) {
          const toastText = await toast.textContent();
          test('Toast says added', toastText.includes('加入'), toastText);
        }

        await page.waitForTimeout(2000);

        // Check cart badge
        await page.waitForTimeout(500);
        const badge = await page.$('#cart-badge-bottom');
        if (badge) {
          const badgeText = await badge.textContent();
          test('Cart badge shows count', badgeText && badgeText.length > 0, badgeText);
        }

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-product-detail.png'), fullPage: true });

        // Add another product
        log('Going back to products for second item...');
        // Use page.goto since bottom nav is hidden on product detail
        await page.goto(BASE + '/#products', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        const cards2 = await page.$$('.product-card');
        if (cards2.length > 1) {
          await cards2[1].click();
          await page.waitForTimeout(1500);
          const addBtn2 = await page.$('.btn--primary');
          if (addBtn2 && (await addBtn2.textContent()).includes('加入购物车')) {
            await addBtn2.click();
            await page.waitForTimeout(1000);
            log('Added second product');
          }
        }
      }
    }

    // ═══════════════════════════════════════════
    // TEST 4: Cart Page
    // ═══════════════════════════════════════════
    log('Navigating to cart...');
    await page.goto(BASE + '/#cart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-cart.png'), fullPage: true });

    const cartItems = await page.$$('.cart-item');
    test('Cart has items', cartItems.length > 0, `${cartItems.length} items`);

    const cartHeader = await page.$('.cart-header h2');
    test('Cart header shows 🛒', cartHeader ? (await cartHeader.textContent()).includes('🛒') : false);

    // Test quantity increment FIRST (changes DOM)
    if (cartItems.length > 0) {
      const incrBtn = await page.$('.qty-btn[data-action="increment"]:not([disabled])');
      if (incrBtn) {
        log('Testing quantity +...');
        await incrBtn.click();
        await page.waitForTimeout(1000);
        const qtyVal = await page.$('.qty-value');
        if (qtyVal) {
          const qty = await qtyVal.textContent();
          test('Quantity incremented', parseInt(qty) >= 2, `qty=${qty}`);
        }
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-cart-qty.png'), fullPage: true });
      }
    }

    // Check cart totals are displayed
    const cartTotal = await page.$('.cart-footer__total');
    test('Cart total shown', !!cartTotal);
    if (cartTotal) {
      const totalText = await cartTotal.textContent();
      test('Cart total is RM format', totalText.startsWith('RM'), totalText);
    }

    // Check checkout button (fresh query — DOM was rebuilt by qty refresh)
    const checkoutBtn = await page.$('#btn-checkout');
    test('Checkout button exists', !!checkoutBtn);

    // ═══════════════════════════════════════════
    // TEST 5: Checkout Step 1 — Contact Info
    // ═══════════════════════════════════════════
    if (checkoutBtn) {
      log('Going to checkout...');
      await checkoutBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-checkout-step1.png'), fullPage: true });

      const stepDots = await page.$$('.checkout-step');
      test('Step indicator visible', stepDots.length >= 3);

      const activeStep = await page.$('.checkout-step.active');
      test('Step 1 is active', !!activeStep);

      // Fill form
      const nameInput = await page.$('#cust-name');
      const phoneInput = await page.$('#cust-phone');
      test('Name field exists', !!nameInput);
      test('Phone field exists', !!phoneInput);

      if (nameInput && phoneInput) {
        log('Filling checkout form...');
        await nameInput.fill('小明');
        await phoneInput.fill('0123456789');
      }

      // Test validation: empty name
      log('Testing validation...');
      await nameInput.fill('');
      const nextBtn1 = await page.$('#btn-step1-next');
      await nextBtn1.click();
      await page.waitForTimeout(500);
      const nameErr = await page.$('#err-name.visible');
      test('Name validation shows error', !!nameErr);

      // Fix and proceed
      await nameInput.fill('小明');
      await nextBtn1.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-checkout-step2.png'), fullPage: true });

      // ═══════════════════════════════════════════
      // TEST 6: Checkout Step 2 — Review
      // ═══════════════════════════════════════════
      const activeStep2 = await page.$('.checkout-step.active');
      const step2OK = activeStep2 && (await activeStep2.textContent()).includes('✓');
      test('Advanced to Step 2', step2OK || (await page.$('.order-summary')) !== null);

      // Check order summary
      const orderItems = await page.$$('.order-summary__item');
      test('Order summary has items', orderItems.length > 0, `${orderItems.length} items`);

      // Check price breakdown
      const priceRows = await page.$$('.price-breakdown__row');
      test('Price breakdown visible', priceRows.length >= 2);

      // Confirm order
      const confirmBtn = await page.$('#btn-step2-confirm');
      test('Confirm button exists', !!confirmBtn);

      if (confirmBtn) {
        log('Confirming order...');
        await confirmBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-checkout-step3.png'), fullPage: true });

        // ═══════════════════════════════════════════
        // TEST 7: Checkout Step 3 — Confirmation
        // ═══════════════════════════════════════════
        const confIcon = await page.$('.confirmation-icon');
        test('Confirmation page loaded', !!confIcon);

        const orderId = await page.$('.detail-row span + span');
        const orderIdText = orderId ? await orderId.textContent() : '';
        test('Order ID displayed', orderIdText.startsWith('ORD-'), orderIdText);

        // WhatsApp button
        const waBtn = await page.$('#btn-whatsapp-send');
        test('WhatsApp button exists', !!waBtn);
        if (waBtn) {
          const waText = await waBtn.textContent();
          test('WhatsApp button text correct', waText.includes('WhatsApp'), waText);
        }

        // Back to shop button
        const backBtn = await page.$('#btn-back-to-shop');
        test('Back to shop button exists', !!backBtn);
      }
    }

    // ═══════════════════════════════════════════
    // TEST 8: Dark Mode Toggle
    // ═══════════════════════════════════════════
    log('Testing dark mode...');
    await page.goto(BASE + '/#home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Initial state should be light
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    test('Initial theme is light or unset', !initialTheme || initialTheme === 'light', `theme=${initialTheme || '(unset)'}`);

    // Click dark mode toggle
    const darkToggle = await page.$('#btn-theme');
    if (darkToggle) {
      await darkToggle.click();
      await page.waitForTimeout(1000);

      const darkTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      test('Theme switched to dark', darkTheme === 'dark', `theme=${darkTheme}`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-dark-mode.png'), fullPage: true });

      // Verify button icon changed
      const darkIcon = await darkToggle.textContent();
      test('Toggle icon changed to sun', darkIcon === '☀️', darkIcon);

      // Toggle back to light
      await darkToggle.click();
      await page.waitForTimeout(500);
      const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      test('Theme switched back to light', lightTheme === 'light', `theme=${lightTheme}`);
    }

    // ═══════════════════════════════════════════
    // TEST 9: Empty Cart State
    // ═══════════════════════════════════════════
    log('Testing empty cart...');
    await page.evaluate(() => localStorage.removeItem('uc_cart'));
    await page.goto(BASE + '/#cart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-empty-cart.png'), fullPage: true });

    const emptyIcon = await page.$('.empty-icon');
    test('Empty cart state shown', !!emptyIcon);
    if (emptyIcon) {
      const emptyIconEmoji = await emptyIcon.textContent();
      test('Empty cart shows 🛒', emptyIconEmoji === '🛒', emptyIconEmoji);
    }

    const browseBtn = await page.$('.empty-state .btn--primary');
    test('Browse button exists in empty cart', !!browseBtn);

    // ═══════════════════════════════════════════
    // TEST 10: Checkout redirect when empty cart
    // ═══════════════════════════════════════════
    log('Testing checkout redirect with empty cart...');
    await page.goto(BASE + '/#checkout', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Should redirect to cart (empty state since no items)
    const currentHash = await page.evaluate(() => window.location.hash);
    test('Empty cart → checkout redirects', currentHash === '#cart', `hash=${currentHash}`);

    // ═══════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════
    console.log('\n════════════════════════════════════');
    const passCount = results.filter(r => r.pass).length;
    const failCount = results.filter(r => !r.pass).length;
    console.log(`RESULTS: ${passCount} passed, ${failCount} failed, ${results.length} total`);
    console.log('Screenshots saved to test-screenshots/');

    if (failCount > 0) {
      console.log('\n❌ FAILURES:');
      results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.name}`));
    }
  } catch (err) {
    console.error('Test crashed:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
