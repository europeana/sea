import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ContentTypeFilter from "./ContentTypeFilter.vue";

const meta = {
  component: ContentTypeFilter,
} satisfies Meta<typeof ContentTypeFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    contentTypes: ["blog post", "project"],
  },
};
