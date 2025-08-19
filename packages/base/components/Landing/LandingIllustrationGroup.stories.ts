import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LandingIllustrationGroup from "./LandingIllustrationGroup.vue";
import sampleData from "../../.storybook/sample-data.js";

const meta = {
  component: LandingIllustrationGroup,
} satisfies Meta<typeof LandingIllustrationGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Section title",
    text: "This text contains info. It can be __marked__. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    illustrations: sampleData.illustrations,
  },
};

export const WithTitleTagOverrideForSubsections: Story = {
  args: {
    title: "Section title",
    text: "This text contains info. It can be __marked__. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    titleTag: "h3",
    illustrations: sampleData.illustrations,
  },
};
