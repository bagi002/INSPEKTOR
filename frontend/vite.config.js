import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || "http://localhost:3001";
const defaultAllowedHosts = ["declared-confirmed-acne-freebsd.trycloudflare.com"];
const allowedHosts = Array.from(
  new Set(
    (process.env.VITE_ALLOWED_HOSTS || defaultAllowedHosts.join(","))
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean),
  ),
);

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
