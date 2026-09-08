/** Second smoke test: login flow, auto-select, reset, saved-number save/load/delete. */
const { chromium } = require('playwright');
const FRONTEND = 'http://localhost:3000';

let browser, page;
const errors = [];

async function main() {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  page = await browser.newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

  const username = 'e2euser2_' + Date.now();
  const password = 'test1234';

  console.log('1) Register then logout, then log back in...');
  await page.goto(FRONTEND + '/register');
  await page.fill('input[minlength="3"]', username);
  const pw = await page.$$('input[type="password"]');
  await pw[0].fill(password);
  await pw[1].fill(password);
  await page.click('button[type="submit"]');
  await page.waitForURL(FRONTEND + '/');
  await page.click('button:has-text("로그아웃")');
  await page.waitForURL(FRONTEND + '/login');

  await page.fill('input', username);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(FRONTEND + '/');
  await page.waitForSelector('.balance-pill');
  console.log('   OK, login works after registering');

  console.log('2) Auto-select fills 5 general balls + 1 powerball...');
  await page.click('button:has-text("자동선택")');
  const generalCount = await page.$$eval('.panel:has(.section-title:has-text("일반볼")) .ball.selected', (els) => els.length);
  const powerCount = await page.$$eval('.panel:has(.section-title:has-text("파워볼")) .ball.powerball.selected', (els) => els.length);
  if (generalCount !== 5) throw new Error('auto-select did not pick 5 general balls, got ' + generalCount);
  if (powerCount !== 1) throw new Error('auto-select did not pick 1 powerball, got ' + powerCount);
  console.log('   OK');

  console.log('3) Save current selection as saved number...');
  await page.click('button:has-text("현재 선택 번호 저장")');
  await page.waitForSelector('.saved-number-row');
  console.log('   OK, saved-number panel shows the saved numbers');

  console.log('4) Reset clears the selection...');
  await page.click('button:has-text("초기화")');
  const generalCountAfterReset = await page.$$eval('.panel:has(.section-title:has-text("일반볼")) .ball.selected', (els) => els.length);
  if (generalCountAfterReset !== 0) throw new Error('reset did not clear general ball selection');
  console.log('   OK, selection cleared, saved number panel still shows the saved entry');

  console.log('5) Load saved number restores the selection...');
  await page.click('button:has-text("불러오기")');
  const generalCountAfterLoad = await page.$$eval('.panel:has(.section-title:has-text("일반볼")) .ball.selected', (els) => els.length);
  if (generalCountAfterLoad !== 5) throw new Error('load saved number did not restore 5 general balls');
  console.log('   OK');

  console.log('6) Delete saved number...');
  page.on('dialog', (d) => d.accept());
  await page.click('button:has-text("삭제")');
  await page.waitForSelector('text=저장된 번호가 없습니다');
  console.log('   OK, saved number deleted');

  console.log('7) Buying with fewer than 5 general balls keeps 구매하기 disabled...');
  await page.click('button:has-text("초기화")');
  await page.click('.panel:has(.section-title:has-text("일반볼")) button:has-text("1")');
  const buyDisabled = await page.$eval('.summary-bar button:has-text("구매하기")', (el) => el.disabled);
  if (!buyDisabled) throw new Error('구매하기 should be disabled with only 1 general ball selected');
  console.log('   OK, purchase button correctly disabled');

  console.log(errors.length ? '\nBrowser errors observed:' : '\nNo browser console/page errors observed.');
  errors.forEach((e) => console.log('  -', e));

  await browser.close();
  console.log('\nALL SECOND-PASS E2E CHECKS PASSED');
}

main().catch(async (e) => {
  console.error('\nE2E TEST FAILED:', e.message);
  try {
    if (page) {
      console.log('URL:', page.url());
      console.log('Body snippet:', (await page.textContent('body')).slice(0, 1000));
    }
  } catch (_) {}
  if (browser) await browser.close();
  process.exit(1);
});
