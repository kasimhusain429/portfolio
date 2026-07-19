const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set viewport to a desktop size
  await page.setViewport({ width: 1280, height: 800 });

  // Listen to console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Wait a bit for 3D to render
  await new Promise(r => setTimeout(r, 2000));
  
  // Scroll to projects section
  console.log('Scrolling to #projects...');
  await page.evaluate(() => {
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 2000));

  console.log('Taking screenshot...');
  const artifactPath = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\313a2a5c-2a47-4ea8-adef-2518324a9552\\screenshot.png';
  await page.screenshot({ path: artifactPath, fullPage: false });
  
  console.log('Screenshot saved to ' + artifactPath);
  await browser.close();
})();
