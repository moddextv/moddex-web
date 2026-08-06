import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * Integration run. Separate from vitest.config.ts because these need a running
 * stack (`docker compose up -d`) and would otherwise fail in CI, where the unit
 * suite must stay runnable with nothing but node.
 *
 *   npx vitest run --config vitest.integration.config.ts
 *
 * TEST_BASE_URL defaults to http://localhost:5099, which is the HOST-side port
 * mapping. Inside the app container the server listens on 4999 and 5099 does
 * not exist, so running there needs it set:
 *
 *   docker compose exec -e TEST_BASE_URL=http://localhost:4999 app \
 *     npx vitest run --config vitest.integration.config.ts
 *
 * Against a deployed environment:
 *   TEST_BASE_URL=https://moddex.tv npx vitest run --config vitest.integration.config.ts
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    // a cold `next dev` route compiles on first request; the auth route took
    // ~120s from cold in this project.
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // one at a time: these share a database and trigger outbound twitch
    // scrapes, so running them in parallel makes them flaky and rude.
    fileParallelism: false,
    sequence: { concurrent: false }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
