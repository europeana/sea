import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CookiesWidget from "./CookiesWidget.vue";

const meta = {
  component: CookiesWidget,
} satisfies Meta<typeof CookiesWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
