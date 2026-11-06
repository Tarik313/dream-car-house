// Optional browser check; see README for isolated runner installation.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';

const chromePath = process.env.PLAYWRIGHT_CHROME_PATH || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
const browser = await chromium.launch({
  ...(chromePath ? { executablePath: chromePath } : {}),
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
 const page = await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[]; const apiRequests=[];
 page.on('pageerror', e=>errors.push(e.message));
 page.on('request', r=>{if(r.url().includes('/api/'))apiRequests.push(r.url())});
 const response=await page.goto('http://127.0.0.1:3100');
 assert.equal(response.status(),200);
 assert.equal(response.headers()['x-robots-tag'],'noindex, nofollow, noarchive');
 assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow, noarchive');
 assert.equal(await page.locator('.sidebar').evaluate(el=>el.getBoundingClientRect().width),224);
 assert.equal(await page.locator('.topbar').evaluate(el=>el.getBoundingClientRect().height),52);
 await page.getByRole('button',{name:'Collapse sidebar'}).click();
 await page.waitForFunction(() => Math.round(document.querySelector('.sidebar')?.getBoundingClientRect().width || 0) === 56);
 assert.equal(Math.round(await page.locator('.sidebar').evaluate(el=>el.getBoundingClientRect().width)),56);
 await page.getByRole('button',{name:'Expand sidebar'}).click();
 await page.getByRole('link',{name:'Workspace',exact:true}).filter({visible:true}).click();
 await page.getByRole('heading',{name:'Workspace access is locked'}).waitFor();
 assert.equal(apiRequests.length,0);
 await page.screenshot({path:'/tmp/begautos-dashboard-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:812});
 assert.equal(await page.locator('.sidebar').isVisible(),false);
 await page.getByRole('button',{name:'Open navigation'}).click();
 assert.equal(await page.getByRole('dialog').isVisible(),true);
 // Native modal dialog confines keyboard focus; Escape restores the opener.
 for(let i=0;i<6;i++) {
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true);
 }
 await page.screenshot({path:'/tmp/begautos-dashboard-mobile-drawer.png',fullPage:true});
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('dialog').isVisible(),false);
 assert.equal(await page.getByRole('button',{name:'Open navigation'}).evaluate(el=>el===document.activeElement),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.getByRole('dialog').getByRole('link',{name:'Access status',exact:true}).click();
 await page.getByRole('heading',{name:'Sign-in is not available yet'}).waitFor();
 assert.equal(await page.getByRole('dialog').isVisible(),false);
 await page.screenshot({path:'/tmp/begautos-dashboard-mobile.png',fullPage:true});
 const robots=await page.request.get('http://127.0.0.1:3100/robots.txt');
 assert.match(await robots.text(),/Disallow: \//);
 assert.equal((await page.request.get('http://127.0.0.1:3100/sitemap.xml')).status(),404);
 const missing=await page.goto('http://127.0.0.1:3100/workspace/inventory');
 assert.equal(missing.status(),404);
 assert.equal(missing.headers()['x-robots-tag'],'noindex, nofollow, noarchive');
 assert.deepEqual(errors,[]);
 assert.deepEqual(apiRequests,[]);
 console.log('PASS: desktop/mobile navigation, modal focus/Escape/return focus, locked workspace, no API fetch, noindex metadata/headers, robots and absent sitemap/modules; no page errors.');
} finally { await browser.close(); }
