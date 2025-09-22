import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CardTestimonialCard from "./CardTestimonialCard.vue";

const meta = {
  component: CardTestimonialCard,
} satisfies Meta<typeof CardTestimonialCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    testimonialText:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    attribution: "M, Museum X",
  },
};

export const Banner: Story = {
  args: {
    testimonialText:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    attribution: "M, Museum X",
    variant: "banner",
  },
};

export const NoAttribution: Story = {
  args: {
    testimonialText:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
};
