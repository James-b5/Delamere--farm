const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG>', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR>', err));
  page.on('request', req => console.log('REQ>', req.method(), req.url()));
  page.on('response', async res => {
    try {
      const url = res.url();
      if (url.includes('/api/')) {
        console.log('RESP>', res.status(), url);
        const ct = res.headers()['content-type'] || '';
        try {
          const text = await res.text();
          if (ct.includes('application/json')) {
            console.log('RESP BODY>', text);
          } else {
            console.log('RESP BODY (non-json) length', text.length);
          }
        } catch (e) {
          console.log('RESP BODY read error', e);
        }
      }
    } catch (e) {
      console.error('Resp read error', e);
    }
  });

  const BASE = 'http://localhost:3000';
  await page.goto(BASE + '/login');
  await page.fill('input#email', process.env.DEBUG_ADMIN_EMAIL || 'admin@example.com');
  await page.fill('input#password', process.env.DEBUG_ADMIN_PASS || 'AdminPassword123!');
  await page.click('button[type="submit"]');
  console.log('Submitted form — waiting 10s');
  await page.waitForTimeout(10000);
  console.log('Url after wait:', page.url());
  await browser.close();
})();
