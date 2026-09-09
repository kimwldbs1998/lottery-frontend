/** Third smoke test: round-change reset behavior (requirement section 3) mid-selection. */
const { chromium } = require('playwright');
const FRONTEND = 'http://localhost:2000';
const BACKEND = 'http://localhost:7070/api';
const ADMIN_KEY = process.env.ADMIN_KEY || 'test-admin-key-12345';

let browser, page;

async function main() {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  page = await browser.newPage();

  const username = 'e2euser3_' + Date.now();
  await page.goto(FRONTEND + '/register');
  await page.fill('input[minlength="3"]', username);
  const pw = await page.$$('input[type="password"]');
  await pw[0].fill('test1234');
  await pw[1].fill('test1234');
  await page.click('button[type="submit"]');
  await page.waitForURL(FRONTEND + '/');

  console.log('1) Select numbers without buying...');
  for (const n of [1, 2, 3, 4, 5]) {
    await page.click(`.panel:has(.section-title:has-text("일반볼")) button:has-text("${n}")`);
  }
  await page.click('.panel:has(.section-title:has-text("파워볼")) button:has-text("3")');
  const before = await page.$$eval('.panel:has(.section-title:has-text("일반볼")) .ball.selected', (els) => els.length);
  if (before !== 5) throw new Error('setup failed, expected 5 selected');
  console.log('   OK, 5 general balls + 1 powerball selected, not purchased');

  console.log('2) Force-settle the round from the server side (simulating the 5-minute rollover)...');
  const resp = await page.request.post(BACKEND + '/admin/rounds/current/force-settle', { headers: { 'X-Admin-Key': ADMIN_KEY } });
  if (!resp.ok()) throw new Error('force-settle failed: ' + resp.status());

  console.log('3) Wait for the 1s poll to notice the round change and reset selection...');
  await page.waitForFunction(() => {
    const selected = document.querySelectorAll('.panel .ball.selected');
    return selected.length === 0;
  }, { timeout: 5000 });
  console.log('   OK, selection was cleared after round change');

  await browser.close();
  console.log('\nALL THIRD-PASS E2E CHECKS PASSED');
}

main().catch(async (e) => {
  console.error('\nE2E TEST FAILED:', e.message);
  if (browser) await browser.close();
  process.exit(1);
});
