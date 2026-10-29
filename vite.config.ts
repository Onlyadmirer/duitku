import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = env.VITE_API_PROXY
    ? {
        "/api": {
          target: env.VITE_API_PROXY,
          changeOrigin: true,
          secure: false,
        },
      }
    : undefined;

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          id: "/",
          name: "Duitku — Catat uangmu, tenang hidupmu",
          short_name: "Duitku",
          description:
            "Catat pemasukan, pengeluaran, dompet, dan anggaran dalam satu tempat.",
          lang: "id",
          dir: "ltr",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#f8f9ff",
          theme_color: "#3525cd",
          categories: ["finance", "productivity"],
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icons/icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          shortcuts: [
            {
              name: "Tambah transaksi",
              short_name: "Transaksi",
              url: "/transaksi/baru",
              icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
            },
            {
              name: "Laporan keuangan",
              short_name: "Laporan",
              url: "/laporan",
              icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: proxy ? { proxy } : undefined,
    preview: proxy ? { proxy } : undefined,
  };
});
