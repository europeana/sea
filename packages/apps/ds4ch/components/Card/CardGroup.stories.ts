import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CardGroup from "./CardGroup.vue";

const meta = {
  component: CardGroup,
} satisfies Meta<typeof CardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TestimonialCardGroup: Story = {
  args: {
    title: "Testimonial card group title",
    text: "Text to introduce or add more info to the testimonial card group. Can contain __marked__ text and [links](#).",
    cards: [
      {
        text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        attribution: "M, Museum X",
        __typename: "TestimonialCard",
      },
      {
        text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        attribution: "A. B., European Commission",
        __typename: "TestimonialCard",
      },
      {
        text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        attribution: "K, Ministry of Culture",
        __typename: "TestimonialCard",
      },
    ],
  },
};
