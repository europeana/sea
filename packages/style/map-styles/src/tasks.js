import fs from "node:fs";
import path from "node:path";

import { styles } from "./styles/index.js";

const STYLES = Object.keys(styles).reduce((memo, styleName) => {
  memo[styleName] = {
    ...styles[styleName],
    dir: path.resolve(import.meta.dirname, `../dist/${styleName}`),
  };
  return memo;
}, {});

const write = (styleName, entry) => {
  const filepath = path.resolve(STYLES[styleName].dir, entry.file);
  fs.writeFileSync(filepath, JSON.stringify(entry.data));
};

const generate = (styleName) => {
  clean(styleName);
  mkdir(styleName);

  const iterator = STYLES[styleName].generator();

  let result = iterator.next();
  while (!result.done) {
    write(styleName, result.value);
    result = iterator.next();
  }
};

const clean = (styleName) => {
  fs.rmSync(STYLES[styleName].dir, { force: true, recursive: true });
};

const mkdir = (styleName) => {
  fs.mkdirSync(STYLES[styleName].dir, { recursive: true });
};

const TASKS = {
  clean,
  generate,
  mkdir,
};

export const runTask = (task, styleName) => {
  if (!Object.hasOwn(TASKS, task)) {
    throw new Error(`Unknown task ${task}`);
  }
  if (!Object.hasOwn(STYLES, styleName)) {
    throw new Error(`Unknown style ${styleName}`);
  }

  TASKS[task](styleName);
};
