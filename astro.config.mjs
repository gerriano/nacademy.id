// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output: the same `dist/` folder deploys to Vercel (staging)
// and to Domainesia via FTP (production).
export default defineConfig({
  site: 'https://nacademy.id',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // /tentang/index.html — works on Apache (Domainesia) without rewrites.
    format: 'directory',
  },
  integrations: [sitemap()],
});
