const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(process.env.URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'artifacts/homepage.png', fullPage: true });
    console.log('Screenshot saved to artifacts/homepage.png');
  } catch (e) {
    console.error('Screenshot failed', e);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
