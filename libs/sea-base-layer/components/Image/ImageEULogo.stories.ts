import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ImageEULogo from "./ImageEULogo.vue";

const meta = {
  component: ImageEULogo,
} satisfies Meta<typeof ImageEULogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
