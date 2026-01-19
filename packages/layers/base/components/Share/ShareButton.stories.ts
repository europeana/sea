import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ShareButton from "./ShareButton.vue";

const meta = {
  component: ShareButton,
} satisfies Meta<typeof ShareButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const PrimaryStyleButton: Story = {
  args: {
    variant: "btn-primary",
  },
};
