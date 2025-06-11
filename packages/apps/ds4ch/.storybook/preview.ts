// import bootstrap css and js
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";

import { setup } from "@storybook/vue3-vite";
import type { Preview } from "@storybook/vue3-vite";

// Mock NuxtLink component
setup((app) => {
  app.component("NuxtLink", {
    props: ["to"],
    template: `<a :href="to"><slot /></a>`,
  });
});

// Automatically generate docs
const preview: Preview = {
  tags: ["autodocs"],
};

export default preview;
