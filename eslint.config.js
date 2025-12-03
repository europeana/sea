import js from "@eslint/js";
import json from "@eslint/json";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import css from "@eslint/css";
import prettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import withNuxt from "./packages/apps/ds4ch/.nuxt/eslint.config.mjs";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default withNuxt(
  defineConfig([
    includeIgnoreFile(gitignorePath),
    {
      files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
      plugins: { js },
      extends: ["js/recommended"],
    },
    {
      files: ["**/*.{json}"],
      plugins: { json },
      extends: ["json/recommended"],
    },
    {
      files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
      languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
    tseslint.configs.recommended,
    pluginVue.configs["flat/essential"],
    {
      files: ["**/*.vue"],
      languageOptions: { parserOptions: { parser: tseslint.parser } },
    },
    {
      files: ["**/*.css"],
      plugins: { css },
      language: "css/css",
      extends: ["css/recommended"],
    },
    {
      files: [
        "packages/apps/*/pages/**/*.vue",
        "packages/apps/*/error.vue",
        "packages/apps/*/layouts/default.vue",
      ],
      rules: { "vue/multi-word-component-names": "off" },
    },
    prettier,
  ]),
);
