import type { Meta, StoryObj } from "@nuxtjs/storybook";

import HomeHero from "./HomeHero.vue";
import sampleData from "../../.storybook/sample-data.js";

const meta = {
  component: HomeHero,
} satisfies Meta<typeof HomeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headline:
      "Welcome to the _Common European data space for cultural heritage_",
    text: "connecting cultural heritage data from across Europe",
    cta: {
      url: "https://www.europeana.eu",
      text: "Contribute to the data space",
    },
    heroImage: {
      ...sampleData.backgroundImages[3],
    },
  },
};
