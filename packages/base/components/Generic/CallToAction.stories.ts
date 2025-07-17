import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CallToAction from "./CallToAction.vue";

const meta = {
  component: CallToAction,
} satisfies Meta<typeof CallToAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Default CTA",
  },
};
export const PrimaryCta: Story = {
  args: {
    text: "Primary CTA",
    classes: "btn-primary",
  },
};
