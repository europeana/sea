import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LandingSubSection from "./LandingSubSection.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: LandingSubSection,
} satisfies Meta<typeof LandingSubSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Landing sub section title",
    text: "Landing sub section text that will display below the title. This is text _with_ possible *markup* and a [link](https://www.europeana.eu)",
    sections: [
      {
        __typename: "ImageCard",
        name: "Card title",
        text: "This text contains info. It can be __marked__ and accompanied by an image. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: sampleData.imagesWithAttribution[0],
        link: { text: "read more", url: "/" },
      },
    ],
  },
};

export const PrimaryCta: Story = {
  args: {
    title: "Landing sub section title",
    text: "Landing sub section text that will display below the title. This is text _with_ possible *markup* and a [link](https://www.europeana.eu)",
    sections: [
      {
        __typename: "ImageCard",
        name: "Card title",
        text: "This text contains info. It can be __marked__ and accompanied by an image. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: sampleData.imagesWithAttribution[0],
        link: { text: "read more", url: "/" },
      },
    ],
    imageCardCtaClasses: "btn-primary icon-chevron",
  },
};
