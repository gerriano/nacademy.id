// Renders the Open Graph image (1200×630) to public/og/default.png.
// Needs Playwright with Chromium available: `node scripts/og.mjs`
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,700;1,6..72,400&family=Plus+Jakarta+Sans:wght@800&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f3f5ef;color:#0f1d16}
  .dot{position:absolute;right:-120px;top:50%;width:620px;height:620px;margin-top:-310px;border-radius:50%;background:#c9f25c}
  .ring{position:absolute;right:-160px;top:50%;width:700px;height:700px;margin-top:-350px;border-radius:50%;border:2px dashed rgba(15,29,22,.18)}
  .logo{position:absolute;isolation:isolate;left:80px;top:72px;font:700 44px 'Newsreader',serif;letter-spacing:-.02em}
  .logo:before{content:'';position:absolute;left:-6px;top:50%;width:56px;height:56px;margin-top:-30px;border-radius:50%;background:#c9f25c;z-index:-1}
  h1{position:absolute;left:80px;bottom:120px;margin:0;font:800 96px/0.92 'Plus Jakarta Sans',sans-serif;letter-spacing:-.055em}
  p{position:absolute;left:80px;bottom:62px;margin:0;font:italic 400 34px 'Newsreader',serif;color:#4b5c52}
  .pill{position:absolute;right:120px;top:50%;transform:translateY(-50%);font:italic 400 40px 'Newsreader',serif;color:#10200f;text-align:center}
  .pill b{display:block;font:800 120px/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.05em}
</style></head><body>
<div class="ring"></div><div class="dot"></div>
<div class="pill">Tarik napas<b>4</b></div>
<div class="logo">Nacademy</div>
<h1>Kendalikan<br>Stres dan<br>Kecemasan</h1>
<p>Guidebook interaktif ala infografis</p>
</body></html>`;

mkdirSync('public/og', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og/default.png' });
await browser.close();
console.log('wrote public/og/default.png');
