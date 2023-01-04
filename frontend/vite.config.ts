import { fileURLToPath, URL } from "node:url";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const pwaOptions: Partial<VitePWAOptions> = {
  manifest: {
    icons: [
      {
        src: "@/assets/house.svg",
        sizes: "any",
        type: "image/svg",
      },
    ],
  },
  registerType: "autoUpdate",
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA(pwaOptions)],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      vue: "vue/dist/vue.esm-bundler.js",
      "balm-ui-plus": "balm-ui/dist/balm-ui-plus.esm.js",
      "balm-ui-css": "balm-ui/dist/balm-ui.css",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://todo-api.thornyshits.website",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
