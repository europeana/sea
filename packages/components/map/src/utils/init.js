import { createApp } from "vue";
import { configProps } from "@/config.js";

export const initApp = (rootComponent, mountSelector = "#europeana-map") => {
  const container = document.querySelector(mountSelector);

  const rootProps = Object.keys(configProps).reduce((memo, propName) => {
    memo[propName] = container.dataset[propName];
    return memo;
  }, {});

  return createApp(rootComponent, rootProps).mount(mountSelector);
};
