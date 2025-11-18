import type { Meta, StoryObj } from "@nuxtjs/storybook";

import AlertMessage from "./AlertMessage.vue";

const meta = {
  component: AlertMessage,
} satisfies Meta<typeof AlertMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: { message: "Example error message" },
  },
};
