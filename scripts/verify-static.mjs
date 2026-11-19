import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat();
}
const articles = (await walk('content/topics')).filter(f => f.endsWith('.md'));
const slugs = new Set();
for (const file of articles) {
  const { data } = matter(await readFile(file, 'utf8'));
  const slug = data.slug || path.basename(file, '.md');
  if (slugs.has(slug)) throw new Error(`Duplicate article slug: ${slug}`);
  slugs.add(slug);
  const html = await readFile(`out/${slug}.html`, 'utf8');
  await access(`out/${slug}/__next.$d$slug.__PAGE__.txt`);
  if (!html.includes(`<link rel="canonical" href="https://physicsexplained.org/${slug}"`)) throw new Error(`Missing canonical: ${slug}`);
  if (/name="robots" content="noindex/.test(html)) throw new Error(`Unexpected noindex: ${slug}`);
}
for (const file of ['index.html', 'categories.html', 'about.html', '404.html', 'robots.txt', 'sitemap.xml']) await access(`out/${file}`);
const sitemap = await readFile('out/sitemap.xml', 'utf8');
for (const slug of slugs) if (!sitemap.includes(`https://physicsexplained.org/${slug}`)) throw new Error(`Missing sitemap entry: ${slug}`);
console.log(`Static export verified: ${slugs.size} unchanged article URLs, canonical and sitemap entries; core files present.`);
