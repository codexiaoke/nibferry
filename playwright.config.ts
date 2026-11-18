import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:3317' },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3317',
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
