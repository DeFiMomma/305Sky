import { chromium } from 'playwright';
import fs from 'fs';
const dir = process.argv[2];
const only = process.argv[3];
const frames = JSON.parse(fs.readFileSync(dir + '/frames.json'));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
await p.goto('file://' + dir + '/render.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
let n = 0;
for (const f of frames) {
  if (only && !f.id.includes(only)) continue;
  const h = await p.$(`[id="${f.id}"]`);
  await h.screenshot({ path: `${dir}/out/${f.id}.jpg`, type: 'jpeg', quality: 90 });
  n++;
}
console.log('rendered', n);
await b.close();
