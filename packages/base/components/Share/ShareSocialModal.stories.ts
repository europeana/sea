import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ShareSocialModal from "./ShareSocialModal.vue";

const meta = {
  component: ShareSocialModal,
} satisfies Meta<typeof ShareSocialModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
