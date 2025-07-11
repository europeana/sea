import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LandingImageCard from "./LandingImageCard.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: LandingImageCard,
} satisfies Meta<typeof LandingImageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    card: {
      name: "Card title",
      text: "This text contains info. It can be __marked__ and accompanied by an image. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: sampleData.imagesWithAttribution[0],
      link: { text: "read more", url: "/" },
    },
  },
};
