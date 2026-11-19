import { defineConfig } from 'cf/config';

export default defineConfig({
  accountId: '75fb37f584344bc26491c8a8c4adecaa',
  worker: {
    name: 'physics-explained',
    domains: ['physicsexplained.org', 'www.physicsexplained.org'],
    compatibilityDate: '2026-11-19',
    observability: { enabled: true, traces: { enabled: true } },
    assets: { htmlHandling: 'auto-trailing-slash', notFoundHandling: '404-page' },
  },
});
