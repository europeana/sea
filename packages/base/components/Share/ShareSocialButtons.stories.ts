import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ShareSocialButtons from "./ShareSocialButtons.vue";

const meta = {
  component: ShareSocialButtons,
} satisfies Meta<typeof ShareSocialButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
