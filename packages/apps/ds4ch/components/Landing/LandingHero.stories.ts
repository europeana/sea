import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LandingHero from "./LandingHero.vue";
import sampleData from "../../.storybook/sample-data.js";

const meta = {
  component: LandingHero,
} satisfies Meta<typeof LandingHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headline: "Hero title",
    text: "This is a landing hero _with_ *markup* and a [link](https://www.europeana.eu)!",
    heroImage: {
      ...sampleData.backgroundImages[0],
      profile: {
        background: "default",
      },
    },
  },
};

export const Alternate: Story = {
  args: {
    headline: "Hero title",
    text: "This is a landing hero _with_ *markup* and a [link](https://www.europeana.eu)!",
    heroImage: {
      ...sampleData.backgroundImages[1],
    },
    variant: "alternate",
  },
};
