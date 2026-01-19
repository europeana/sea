import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PaginationNavInput from "./PaginationNavInput.vue";

const meta = {
  component: PaginationNavInput,
} satisfies Meta<typeof PaginationNavInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalItems: 100,
  },
};
