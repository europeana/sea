import type { Meta, StoryObj } from "@nuxtjs/storybook";

import RelatedCategoryTags from "./RelatedCategoryTags.vue";

const meta = {
  component: RelatedCategoryTags,
} satisfies Meta<typeof RelatedCategoryTags>;

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
