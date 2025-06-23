import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PageNavbar from "./PageNavbar.vue";

const meta = {
  component: PageNavbar,
} satisfies Meta<typeof PageNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
