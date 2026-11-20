import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ContentTagsList from "./ContentTagsList.vue";

const meta = {
  component: ContentTagsList,
} satisfies Meta<typeof ContentTagsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    badgeVariant: "badge-secondary",
    tags: [
      {
        identifier: "Women's history",
        name: "Women's history",
      },
      {
        identifier: "Renaissance",
        name: "Renaissance",
      },
    ],
  },
};
