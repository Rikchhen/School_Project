import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // mongodb-memory-server can take a moment to download/spin up on first run
    testTimeout: 30000,
    hookTimeout: 60000,
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Run test files sequentially so they can each own a fresh in-memory DB
    fileParallelism: false,
  },
});
