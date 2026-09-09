/**
 * Ad-hoc end-to-end smoke test driven with the sandbox's pre-installed Chromium via Playwright.
 * Not part of the delivered project (it's a throwaway verification script run once during
 * development) — it exercises: register -> select numbers -> PowerUp -> buy -> see receipt ->
 * check history -> force-settle via the admin API -> confirm history/results update.
 */
const { chromium } = require('playwright');

const FRONTEND = 'http://localhost:2000';
const BACKEND = 'http://localhost:7070/api';

function adminKey() {
  return process.env.ADMIN_KEY || 'test-admin-key-12345';
}

let browser, page;
const errors = [];

async function main() {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });
  page = await browser.newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('console.error: ' + msg.text());
  });

  const username = 'e2euser' + Date.now();
  const password = 'test1234';

  console.log('1) Register...');
  await page.goto(FRONTEND + '/register');
  await page.fill('input[minlength="3"]', username);
  const pwFields = await page.$$('input[type="password"]');
  await pwFields[0].fill(password);
  await pwFields[1].fill(password);
  await page.click('button[type="submit"]');
  await page.waitForURL(FRONTEND + '/');
  await page.waitForSelector('.balance-pill');
  console.log('   OK, landed on game page with balance pill visible');

  // Read the actual current round number from the API rather than assuming round 1,
  // so this script can be re-run against a server that already has history.
  const roundBefore = await (await page.request.get(BACKEND + '/rounds/current')).json();
  const roundNumber = roundBefore.roundNumber;
  console.log(`   Current round is ${roundNumber}`);

  console.log('2) Select 5 general balls...');
  for (const n of [1, 2, 3, 4, 5]) {
    await page.click(`.panel:has(.section-title:has-text("일반볼")) button:has-text("${n}")`);
  }
  const generalSelectedCount = await page.$$eval(
    '.panel:has(.section-title:has-text("일반볼")) .ball.selected',
    (els) => els.length
  );
  if (generalSelectedCount !== 5) throw new Error('expected 5 general balls selected, got ' + generalSelectedCount);
  console.log('   OK, 5 general balls selected');

  console.log('3) Select ALL powerballs...');
  await page.click('.panel:has(.section-title:has-text("파워볼")) button:has-text("ALL")');
  const powerballSelectedCount = await page.$$eval(
    '.panel:has(.section-title:has-text("파워볼")) .ball.powerball.selected',
    (els) => els.length
  );
  if (powerballSelectedCount !== 10) throw new Error('expected 10 powerballs selected (ALL), got ' + powerballSelectedCount);
  console.log('   OK, ALL selected (10 powerballs)');

  console.log('4) Toggle PowerUp...');
  await page.click('button:has-text("PowerUp 적용하기")');
  await page.waitForSelector('.powerup-btn.active');
  console.log('   OK, PowerUp active');

  console.log('5) Check summary bar shows 10 games @ Rs 60 = Rs 600...');
  const summaryText = await page.textContent('.summary-bar');
  if (!summaryText.includes('10게임') || !summaryText.includes('Rs 600')) {
    throw new Error('summary bar did not show expected totals: ' + summaryText);
  }
  console.log('   OK');

  console.log('6) Open purchase confirm modal and confirm...');
  await page.click('.summary-bar button:has-text("구매하기")');
  await page.waitForSelector('.modal-card:has-text("구매 확인")');
  await page.click('.modal-card button:has-text("구매 확정")');
  await page.waitForSelector('.modal-card:has-text("구매 완료")', { timeout: 10000 });
  const receiptText = await page.textContent('.modal-card');
  if (!receiptText.includes('Rs 600')) throw new Error('receipt missing total amount: ' + receiptText);
  console.log('   OK, purchase completed, receipt shown');
  await page.click('.modal-card button:has-text("확인")');

  console.log('7) Balance pill should now read Rs 99,400...');
  await page.waitForFunction(() => document.querySelector('.balance-pill')?.textContent.includes('99,400'));
  console.log('   OK');

  console.log('8) Check history page shows the purchase...');
  await page.click('a:has-text("구매내역")');
  await page.waitForSelector('.history-card');
  const historyText = await page.textContent('.history-card');
  if (!historyText.includes(`${roundNumber}회차`) || !historyText.includes('추첨 대기')) {
    throw new Error('history card missing expected round/status: ' + historyText);
  }
  console.log('   OK, history shows current round, pending draw');

  console.log('9) Force-settle the round via admin API...');
  const settleResp = await page.request.post(BACKEND + '/admin/rounds/current/force-settle', {
    headers: { 'X-Admin-Key': adminKey() },
  });
  if (!settleResp.ok()) throw new Error('force-settle failed: ' + settleResp.status());
  console.log('   OK, round settled');

  console.log('10) Reload history, expect settled status and a tier/payout shown...');
  await page.reload();
  await page.waitForSelector('.history-card');
  const historyText2 = await page.textContent('.history-card');
  if (!historyText2.includes('추첨 완료')) throw new Error('history did not update to settled: ' + historyText2);
  if (!/[1-5]등|미당첨/.test(historyText2)) throw new Error('no tier label found in settled history: ' + historyText2);
  console.log('   OK, settled with tier/payout info shown');

  console.log('11) Check results page shows this round draw...');
  await page.click('a:has-text("추첨결과")');
  await page.waitForURL(FRONTEND + '/results');
  await page.waitForSelector('.history-card');
  const resultsText = await page.textContent('.container');
  if (!resultsText.includes(`${roundNumber}회차`) || !resultsText.includes('추첨 완료')) {
    throw new Error('results page missing expected round info: ' + resultsText);
  }
  console.log('   OK, results page shows the round as settled with drawn numbers');

  console.log('12) Logout and confirm redirected to login...');
  await page.click('button:has-text("로그아웃")');
  await page.waitForURL(FRONTEND + '/login');
  console.log('   OK');

  console.log(errors.length ? '\nBrowser console/page errors observed:' : '\nNo browser console/page errors observed.');
  errors.forEach((e) => console.log('  -', e));

  await browser.close();
  console.log('\nALL E2E CHECKS PASSED');
}

main().catch(async (e) => {
  console.error('\nE2E TEST FAILED:', e.message);
  if (errors.length) {
    console.log('Browser console/page errors so far:');
    errors.forEach((err) => console.log('  -', err));
  }
  try {
    if (page) {
      console.log('Current URL:', page.url());
      console.log('Body text snippet:', (await page.textContent('body')).slice(0, 1500));
      await page.screenshot({ path: '/tmp/e2e-failure.png' });
      console.log('Screenshot saved to /tmp/e2e-failure.png');
    }
  } catch (inner) {
    console.log('(could not capture debug info: ' + inner.message + ')');
  }
  if (browser) await browser.close();
  process.exit(1);
});
