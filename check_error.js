const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        await new Promise(r => setTimeout(r, 2000));
        await browser.close();
    } catch (e) {
        console.error('PUPPETEER ERROR:', e);
    }
})();
