import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';

const origin = 'https://physicsexplained.org';
const sitemap = await readFile('out/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
urls.push(`${origin}/categories/classical-mechanics`, `${origin}/categories/classical-mechanics/dynamics`, `${origin}/robots.txt`, `${origin}/sitemap.xml`);
async function walk(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : `${dir}/${e.name}`))).flat();
}
for (const file of await walk('out/categories')) if (file.endsWith('.html')) urls.push(`${origin}/${file.slice(4, -5)}`);
const homepage = await readFile('out/index.html', 'utf8');
for (const match of homepage.matchAll(/(?:src|href)="(\/_next\/[^"?]+(?:\?[^" ]*)?)"/g)) urls.push(`${origin}${match[1].replaceAll('&amp;', '&')}`);
urls.push('https://www.physicsexplained.org', 'http://physicsexplained.org');
for (const slug of ['why-do-mirrors-reflect', 'what-is-light', 'how-do-lenses-work']) urls.push(`${origin}/${slug}/__next.%24d%24slug.__PAGE__.txt?_rsc=verification`);
const results = [];
async function check(url, expected = 200) {
  try {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const body = await response.text();
  const isHtml = response.headers.get('content-type')?.includes('text/html');
  const canonical = isHtml ? body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] : undefined;
  const expectedCanonical = `${origin}${new URL(url).pathname === '/' ? '' : new URL(url).pathname}`;
  const ok = response.status === expected && (expected !== 200 || !isHtml || (body.includes('Physics Explained') && canonical === expectedCanonical && !/name="robots" content="[^"]*noindex/.test(body))) && new URL(response.url).protocol === 'https:';
  results.push({ url, status: response.status, finalUrl: response.url, canonical, ok });
  } catch (error) {
    results.push({ url, ok: false, error: error.message });
  }
}
const uniqueUrls = [...new Set(urls)];
for (let i = 0; i < uniqueUrls.length; i += 6) await Promise.all(uniqueUrls.slice(i, i + 6).map(url => check(url)));
await check(`${origin}/__deployment-check-missing-page-20261119`, 404);
await mkdir('local-data', { recursive: true });
await writeFile('local-data/live-verification.json', JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
const failed = results.filter(r => !r.ok);
console.log(JSON.stringify({ checked: results.length, failed }, null, 2));
if (failed.length) process.exitCode = 1;
