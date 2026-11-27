import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const tsOptions = {
  tsconfig: "./tsconfig.json",
  include: ["src/**/*", "lang/**/*"],
  composite: false,
  declaration: false,
  declarationDir: undefined,
};

export default [
  // 1. Library build (CJS + ESM)
  {
    input: "./src/index.ts",
    output: [
      { file: "./dist/index.cjs", format: "cjs", sourcemap: true },
      { file: "./dist/index.mjs", format: "esm", sourcemap: true },
    ],
    plugins: [nodeResolve(), json(), typescript(tsOptions), terser()],
  },
  // 2. CLI bin build
  {
    input: "./src/sync.ts",
    output: {
      file: "./dist/sync.mjs",
      format: "esm",
      sourcemap: true,
      banner: "#!/usr/bin/env node",
    },
    plugins: [nodeResolve(), json(), typescript(tsOptions), terser()],
  },
  // 3. Bundled type definitions at dist/index.d.ts
  {
    input: "./src/index.ts",
    output: { file: "./dist/index.d.ts", format: "esm" },
    plugins: [json(), dts()],
  },
];
