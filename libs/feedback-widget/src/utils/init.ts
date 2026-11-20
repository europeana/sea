import { createApp, type Component } from "vue";

import { configProps } from "../config";

export const initFeedbackWidgetApp = (
  rootComponent: Component,
  mountSelector = "#europeana-feedback-widget",
): void => {
  const container = document.querySelector<HTMLElement>(mountSelector);
  if (!container) {
    return;
  }

  const rootProps = (
    Object.keys(configProps) as Array<keyof typeof configProps>
  ).reduce<Record<string, string | undefined>>((memo, propName) => {
    memo[propName] = container.dataset[propName];
    return memo;
  }, {});

  createApp(rootComponent, rootProps).mount(mountSelector);
};
