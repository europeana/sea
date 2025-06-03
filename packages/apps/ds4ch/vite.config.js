// Vue plugin needed to run storybook. Issue: https://github.com/storybookjs/storybook/issues/26306
// Components plugin handles auto import of components (Nuxt feature)
// TODO: we might need an auto-import plugin for composables or other modules later on: https://www.npmjs.com/package/unplugin-auto-import

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: [
        'components',
      ],
    })
  ],
});
