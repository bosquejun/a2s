import { createRequire } from "node:module";

import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // `server-only` is a build-time marker with no standalone package here;
      // Next ships a no-op copy. Alias to it so server modules can be unit-tested.
      "server-only": require.resolve("next/dist/compiled/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
