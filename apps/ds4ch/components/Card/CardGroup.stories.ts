import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CardGroup from "./CardGroup.vue";
import sampleData from "../../.storybook/sample-data.js";

const meta = {
  component: CardGroup,
} satisfies Meta<typeof CardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentCardGroup: Story = {
  args: {
    title: "Content card group title",
    text: "Text to introduce or add more info to the content card group. Can contain __marked__ text and [links](#).",
    cards: [
      {
        name: "News post 1",
        url: { name: "news__slug", params: { slug: "post1" } },
        primaryImageOfPage: sampleData.imagesWithAttribution[0],
        __typename: "ContentCard",
      },
    ],
  },
};

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
