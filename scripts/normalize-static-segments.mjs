import { readdir, copyFile, access } from 'node:fs/promises';

// Next.js 16.1.1 Windows static export can emit segment filenames as directories.
// Retain originals and add the flat filenames requested by the browser.
async function walk(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : `${dir}/${e.name}`))).flat();
}
let count = 0;
for (const file of await walk('out')) {
  const match = file.match(/^(.*\/)(__next\.[^/]+)\/(.+\.txt)$/);
  if (!match) continue;
  const target = `${match[1]}${match[2]}.${match[3].replaceAll('/', '.')}`;
  try { await access(target); throw new Error(`Segment filename collision: ${target}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await copyFile(file, target);
  count++;
}
console.log(`Normalized ${count} Windows static segment paths.`);
