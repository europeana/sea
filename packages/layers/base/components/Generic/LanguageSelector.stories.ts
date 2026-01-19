import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LanguageSelector from "./LanguageSelector.vue";

const meta = {
  component: LanguageSelector,
} satisfies Meta<typeof LanguageSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
