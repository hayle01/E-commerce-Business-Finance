import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      // Services import the Prisma singleton at module load; no connection
      // is opened unless a query runs, so a placeholder is enough.
      DATABASE_URL: "postgres://localhost:5432/placeholder",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
