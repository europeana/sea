import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Silence deprecation warnings until Bootstrap 5 updates Sass: https://github.com
        silenceDeprecations: ["global-builtin", "import", "color-functions"],
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  plugins: [vue(), svgLoader()],
});
