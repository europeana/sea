import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ImageCiteAttribution from "./ImageCiteAttribution.vue";

const meta = {
  component: ImageCiteAttribution,
} satisfies Meta<typeof ImageCiteAttribution>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "The Milkmaid",
    creator: "Johannes Vermeer",
    provider: "Rijksmuseum",
    rightsStatement: "http://creativecommons.org/publicdomain/mark/1.0/",
    url: "https://www.example.eu/milkmaid",
    extended: true,
  },
};

export const Minimal: Story = {
  args: {
    rightsStatement: "http://creativecommons.org/publicdomain/mark/1.0/",
  },
};

export const NoUrl: Story = {
  args: {
    name: "The Milkmaid",
    creator: "Johannes Vermeer",
    provider: "Rijksmuseum",
    rightsStatement: "http://creativecommons.org/publicdomain/mark/1.0/",
    extended: true,
  },
};

export const NoExtended: Story = {
  args: {
    name: "The Milkmaid",
    creator: "Johannes Vermeer",
    provider: "Rijksmuseum",
    rightsStatement: "http://creativecommons.org/publicdomain/mark/1.0/",
    url: "https://www.example.eu/milkmaid",
  },
};
