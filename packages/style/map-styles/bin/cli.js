#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const STYLE_DIRENTS = fs
  .readdirSync(path.resolve(import.meta.dirname, "../src/"), {
    withFileTypes: true,
  })
  .filter((dirent) => dirent.isDirectory());

const STYLES = STYLE_DIRENTS.reduce((memo, dirent) => {
  memo[dirent.name] = {
    build: import(
      path.resolve(dirent.parentPath, `${dirent.name}/index.js`)
    ).then((module) => module.build),
    dir: path.resolve(import.meta.dirname, `../dist/${dirent.name}`),
  };
  return memo;
}, {});

const write = (styleName, entry) => {
  const filepath = path.resolve(STYLES[styleName].dir, entry.file);
  fs.writeFileSync(filepath, entry.data);
};

const build = async (styleName) => {
  clean(styleName);
  mkdir(styleName);

  const builder = (await STYLES[styleName].build)();

  let result = builder.next();
  while (!result.done) {
    write(styleName, result.value);
    result = builder.next();
  }
};

const clean = (styleName) => {
  fs.rmSync(STYLES[styleName].dir, { force: true, recursive: true });
};

const mkdir = (styleName) => {
  fs.mkdirSync(STYLES[styleName].dir, { recursive: true });
};

const TASKS = {
  build,
  clean,
  mkdir,
};

const runTask = (styleName, task) => {
  if (!Object.hasOwn(STYLES, styleName)) {
    throw new Error(`Unknown style ${styleName}`);
  }
  if (!Object.hasOwn(TASKS, task)) {
    throw new Error(`Unknown task ${task}`);
  }

  TASKS[task](styleName);
};

runTask(process.argv[2], process.argv[3]);
