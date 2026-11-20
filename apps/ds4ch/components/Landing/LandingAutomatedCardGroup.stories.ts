import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LandingAutomatedCardGroup from "./LandingAutomatedCardGroup.vue";

const meta = {
  component: LandingAutomatedCardGroup,
} satisfies Meta<typeof LandingAutomatedCardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    staticItems: [
      {
        info: "16,000 +",
        label: "Visits per day",
      },
      {
        info: "57,000,000 +",
        label: "Items",
      },
      {
        info: "3,700 +",
        label: "Providing institutions",
      },
    ],
  },
};
