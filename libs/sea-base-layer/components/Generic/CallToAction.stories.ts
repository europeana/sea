import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CallToAction from "./CallToAction.vue";

const meta = {
  component: CallToAction,
} satisfies Meta<typeof CallToAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Default (primary) CTA",
    classes: "btn-primary icon-chevron",
  },
};
export const SecondaryCta: Story = {
  args: {
    text: "Secondary CTA",
    classes: "btn-secondary icon-chevron",
  },
};
