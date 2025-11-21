import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",         // keep if you need to bind IPv6/0.0.0.0
    port: 8080,         // frontend dev port
    fs: {
      allow: ["."],
      // you can keep deny for sensitive files, but no need to deny "server/**" if removed
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
    // Proxy API requests to your FastAPI dev server (default FastAPI port 8000)
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, "/api"), // optional
      },
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
