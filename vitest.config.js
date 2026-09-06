import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["dotenv/config"],
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.js"],
      exclude: [
        "src/app.js",
        "src/Commons/config.js",
        "src/Infrastructures/database/**",
        "src/Infrastructures/container.js",
      ],
    },
  },
});
