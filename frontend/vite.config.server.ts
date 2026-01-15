import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "../dist/server",
    ssr: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src/App.tsx"),
      output: {
        format: "esm",
        entryFileNames: "node-build.mjs",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
