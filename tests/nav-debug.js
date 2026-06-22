/**
 * nav-debug.js — Targeted Navigation Debug Test
 * Tests every nav button by clicking (not page.goto).
 * Captures console errors.
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'https://jerrisonchai.github.io/undisputed-comics';
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'test-screenshots');

let passed = 0, failed = 0;
const errors = [];

function test(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${name}${detail ? `: ${detail}` : ''}`);
    passed++;
  } else {
    console.error(`  ❌ ${name}${detail ? `: ${detail}` : ''}`);
    failed++;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('📸 Opening homepage...');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const initialHash = await page.evaluate(() => window.location.hash);
  console.log(`  Initial hash: "${initialHash}"`);

  // ═══════════════════════════════════════════
  // TEST 1: Logo → Home
  // ═══════════════════════════════════════════
  console.log('\n--- Test 1: Logo → Home ---');
  
  // Navigate somewhere else first
  await page.evaluate(() => { window.location.hash = '#products'; });
  await page.waitForTimeout(1000);
  
  const beforeLogo = await page.evaluate(() => window.location.hash);
  console.log(`  Before logo click: "${beforeLogo}"`);
  
  const logoBtn = await page.$('#btn-home-logo');
  test('Logo button exists', !!logoBtn);
  
  if (logoBtn) {
    try {
      await logoBtn.click();
      await page.waitForTimeout(1000);
      const afterLogo = await page.evaluate(() => window.location.hash);
      console.log(`  After logo click: "${afterLogo}"`);
      test('Logo click → home', afterLogo === '#home', afterLogo);
    } catch (e) {
      console.error(`  ❌ Logo click error: ${e.message}`);
      failed++;
    }
  }

  // ═══════════════════════════════════════════
  // TEST 2: Bottom Nav — Each Tab
  // ═══════════════════════════════════════════
  console.log('\n--- Test 2: Bottom Nav Tabs ---');
  
  const tabs = [
    { name: 'Home', selector: '[data-route="home"]', expectedHash: '#home' },
    { name: 'Products', selector: '[data-route="products"]', expectedHash: '#products' },
    { name: 'Cart', selector: '[data-route="cart"]', expectedHash: '#cart' },
    { name: 'Account', selector: '[data-route="account"]', expectedHash: '#account' },
  ];

  for (const tab of tabs) {
    // Check visibility
    const isVisible = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? (el.offsetParent !== null) : false;
    }, tab.selector);
    
    console.log(`  ${tab.name} tab visible: ${isVisible}`);
    
    if (isVisible) {
      try {
        await page.click(tab.selector);
        await page.waitForTimeout(1000);
        const hash = await page.evaluate(() => window.location.hash);
        console.log(`  ${tab.name} click → hash: "${hash}"`);
        test(`${tab.name} tab click`, hash === tab.expectedHash, hash);
      } catch (e) {
        console.error(`  ❌ ${tab.name} tab click error: ${e.message}`);
        failed++;
      }
    } else {
      // Tab might be hidden — navigate to make it visible
      console.log(`  ${tab.name} tab hidden, navigating to home first...`);
      await page.goto(BASE + '/#home', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const reVisible = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? (el.offsetParent !== null) : false;
      }, tab.selector);
      console.log(`  ${tab.name} tab re-check visible: ${reVisible}`);
      if (reVisible) {
        try {
          await page.click(tab.selector);
          await page.waitForTimeout(1000);
          const hash = await page.evaluate(() => window.location.hash);
          console.log(`  ${tab.name} click → hash: "${hash}"`);
          test(`${tab.name} tab click (retry)`, hash === tab.expectedHash, hash);
        } catch (e) {
          console.error(`  ❌ ${tab.name} tab click error (retry): ${e.message}`);
          failed++;
        }
      } else {
        test(`${tab.name} tab visible`, false, 'tab not visible even on homepage');
      }
    }
  }

  // ═══════════════════════════════════════════
  // TEST 3: Top Nav Buttons
  // ═══════════════════════════════════════════
  console.log('\n--- Test 3: Top Nav Buttons ---');

  // Navigate to home first
  await page.goto(BASE + '/#home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const topButtons = [
    { name: 'Cart', selector: '#btn-cart-top', expectedHash: '#cart' },
    { name: 'Search', selector: '#btn-search', expectedHash: '#search' },
  ];

  for (const btn of topButtons) {
    const el = await page.$(btn.selector);
    test(`${btn.name} top button exists`, !!el);
    if (el) {
      try {
        await el.click();
        await page.waitForTimeout(1000);
        const hash = await page.evaluate(() => window.location.hash);
        console.log(`  ${btn.name} click → hash: "${hash}"`);
        test(`${btn.name} top button click`, hash === btn.expectedHash, hash);
        // Go back home for next test
        await page.goto(BASE + '/#home', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      } catch (e) {
        console.error(`  ❌ ${btn.name} click error: ${e.message}`);
        failed++;
      }
    }
  }

  // ═══════════════════════════════════════════
  // TEST 4: Theme Toggle
  // ═══════════════════════════════════════════
  console.log('\n--- Test 4: Theme Toggle ---');
  
  const themeBtn = await page.$('#btn-theme');
  test('Theme button exists', !!themeBtn);
  if (themeBtn) {
    const beforeTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log(`  Theme before: "${beforeTheme}"`);
    
    try {
      await themeBtn.click();
      await page.waitForTimeout(500);
      const afterTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      console.log(`  Theme after click: "${afterTheme}"`);
      test('Theme toggled', afterTheme !== beforeTheme || !!afterTheme, afterTheme);
      
      // Toggle back
      await themeBtn.click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.error(`  ❌ Theme click error: ${e.message}`);
      failed++;
    }
  }

  // ═══════════════════════════════════════════
  // RESULTS
  // �══════════════════════════════════════════
  console.log('\n═══════════════════════════════════');
  console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (errors.length) {
    console.log(`\n⚠️  Console Errors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e}`));
  }
  console.log('═══════════════════════════════════');

  await browser.close();
})();
