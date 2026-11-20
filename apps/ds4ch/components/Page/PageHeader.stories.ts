import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PageHeader from "./PageHeader.vue";

const meta = {
  component: PageHeader,
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
