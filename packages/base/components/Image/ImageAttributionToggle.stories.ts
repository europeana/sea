import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ImageAttributionToggle from "./ImageAttributionToggle.vue";

const meta = {
  component: ImageAttributionToggle,
} satisfies Meta<typeof ImageAttributionToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    attribution: {
      name: "Something",
      creator: "Someone",
      provider: "Somewhere",
      license: "http://creativecommons.org/licenses/by-nd/4.0/",
      url: "http://www.example.org/",
    },
  },
};
