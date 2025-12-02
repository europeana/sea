import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ErrorMessage from "./ErrorMessage.vue";

const meta = {
  component: ErrorMessage,
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: { statusCode: 520, message: "Something went wrong" },
  },
};

export const NotFound: Story = {
  args: {
    error: { statusCode: 404 },
  },
};
