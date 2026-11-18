import { defineConfig } from '@playwright/test';

const preview = Boolean(process.env.DOCS_PREVIEW_DIR);
const baseURL = preview
  ? 'http://127.0.0.1:3318' + (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/'
  : 'http://127.0.0.1:3317/';

export default defineConfig({
  testDir: './tests',
  use: { baseURL },
  webServer: {
    command: preview
      ? 'python3 -m http.server 3318 --bind 127.0.0.1 --directory "$DOCS_PREVIEW_DIR"'
      : 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
