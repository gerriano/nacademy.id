// Turns dist/ into dist-artifact/: a copy of the site that runs inside a
// claude.ai Artifact (used for UI/UX review comments).
//  - CSS and JS are inlined (one bundled module per page, so shared code
//    like the motion engine runs once)
//  - root-absolute links become relative ("/tentang/" → "tentang/index.html")
//  - index.html loses its document shell, which the Artifact host adds
import { readFileSync, writeFileSync, rmSync, cpSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { build } from 'rolldown';

const SRC = 'dist';
const OUT = 'dist-artifact';
rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const htmlFiles = walk(OUT).filter((f) => f.endsWith('.html'));
const work = mkdtempSync(join(tmpdir(), 'nac-artifact-'));

for (const file of htmlFiles) {
  let html = readFileSync(file, 'utf8');
  const rel = relative(OUT, file).split('\\').join('/');
  const depth = rel.split('/').length - 1;
  const up = depth ? '../'.repeat(depth) : '';

  // 1. Inline local stylesheets
  html = html.replace(/<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)"\s*\/?>/g, (_, href) =>
    `<style>${readFileSync(join(OUT, href), 'utf8')}</style>`);

  // 2. Bundle all local module scripts of this page into one inline module
  const srcs = [...html.matchAll(/<script type="module" src="(\/_astro\/[^"]+\.js)"><\/script>/g)].map((m) => m[1]);
  if (srcs.length) {
    const entry = join(work, `entry-${Math.random().toString(36).slice(2)}.js`);
    writeFileSync(entry, srcs.map((s) => `import ${JSON.stringify(join(process.cwd(), SRC, s))};`).join('\n'));
    const out = await build({ input: entry, write: false, output: { format: 'esm', minify: true }, logLevel: 'silent' });
    const code = out.output[0].code.replace(/<\/script/gi, '<\\/script');
    let first = true;
    html = html.replace(/<script type="module" src="\/_astro\/[^"]+\.js"><\/script>/g, () => {
      if (!first) return '';
      first = false;
      return `<script type="module">${code}</script>`;
    });
  }

  // 3. Root-absolute URLs → relative
  html = html.replace(/(href|src)="\/(?!\/)([^"#?]*)([^"]*)"/g, (_, attr, path, rest) => {
    let target = path;
    if (target === '' || target.endsWith('/')) target += 'index.html';
    return `${attr}="${up}${target}${rest}"`;
  });

  // 4. The Artifact host wraps the main page in its own document shell
  if (rel === 'index.html') {
    html = html
      .replace(/<!DOCTYPE html>/i, '')
      .replace(/<html[^>]*>/i, '')
      .replace(/<\/html>/i, '')
      .replace(/<head>/i, '')
      .replace(/<\/head>/i, '')
      .replace(/<body[^>]*>/i, '')
      .replace(/<\/body>/i, '')
      .replace(/<meta charset="utf-8"\s*\/?>/i, '')
      .replace(/<meta name="viewport"[^>]*>/i, '');
    html = html.replace(/(<title>[^<]*<\/title>)/, '<title>Nacademy</title><meta name="claude:viewport-fit-sides" content="cover">');
  }
  writeFileSync(file, html);
}

// JS/CSS now live inline; keep only images and other static files
rmSync(join(OUT, '_astro'), { recursive: true, force: true });
rmSync(work, { recursive: true, force: true });
const files = walk(OUT).map((f) => relative(OUT, f).split('\\').join('/'));
writeFileSync(join(OUT, '..', 'dist-artifact.files.json'), JSON.stringify(files, null, 2));
console.log(`artifact build: ${files.length} files in ${OUT}/`);
