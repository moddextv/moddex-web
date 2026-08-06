import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    // node, not jsdom: everything covered here is server-side or pure. adding
    // a dom only to run pure functions costs startup time and hides the fact
    // that these modules must not touch the browser.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // db-backed integration tests come later (see NEXT-STEPS §7) and will need
    // their own compose.test.yaml; keep them out of the default run until then.
    exclude: ['tests/integration/**']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
