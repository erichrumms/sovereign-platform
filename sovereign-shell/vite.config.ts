import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * SOVEREIGN Platform — sovereign-shell Vite configuration.
 * The shell is the Option C host application. Product modules build and deploy
 * on independent pipelines; this config covers the shell host only.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
