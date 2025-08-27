import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ShareSocialLink from "./ShareSocialLink.vue";

const meta = {
  component: ShareSocialLink,
} satisfies Meta<typeof ShareSocialLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bluesky: Story = {
  args: { network: "bluesky" },
};

export const Facebook: Story = {
  args: { network: "facebook" },
};

export const LinkedIn: Story = {
  args: { network: "linkedin" },
};
