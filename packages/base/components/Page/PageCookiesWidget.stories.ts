import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PageCookiesWidget from "./PageCookiesWidget.vue";

const meta = {
  component: PageCookiesWidget,
} satisfies Meta<typeof PageCookiesWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
