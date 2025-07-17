import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [],
      manifest: {
        name: "A Game Room",
        short_name: "Game Room",
        start_url: "/",
        display: "standalone",
        background_color: "#808080",
        theme_color: "#808080",
        icons: [
          {
            src: "/icons/icon_192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "/icons/icon_512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
    }),
  ],
  build: {
    target: "chrome126",
  },
  server: {
    allowedHosts: true,
  },
});
