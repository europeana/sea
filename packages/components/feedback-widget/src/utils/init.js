import { createApp } from "vue";
import { configProps } from "@/config.js";

export const initFeedbackWidgetApp = (
  rootComponent,
  mountSelector = "#europeana-feedback-widget",
) => {
  const container = document.querySelector(mountSelector);

  const rootProps = Object.keys(configProps).reduce((memo, propName) => {
    memo[propName] = container.dataset[propName];
    return memo;
  }, {});

  createApp(rootComponent, rootProps).mount(mountSelector);
};
