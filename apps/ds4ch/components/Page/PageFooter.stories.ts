import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PageFooter from "./PageFooter.vue";

const meta = {
  component: PageFooter,
} satisfies Meta<typeof PageFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
