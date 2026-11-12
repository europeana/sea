import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ContentCard from "./ContentCard.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: ContentCard,
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Title",
    imageUrl: sampleData.thumbnails[0],
    text: "Text on a content card",
    style: "max-width: 18rem;",
    url: "/",
  },
};

export const News: Story = {
  args: {
    title: "Title",
    imageUrl: sampleData.thumbnails[1],
    text: "Created 18 August 2025",
    style: "max-width: 18rem;",
    url: "/news/post",
  },
};

export const Project: Story = {
  args: {
    title: "Title",
    imageUrl: sampleData.thumbnails[1],
    text: "Text on a content card",
    style: "max-width: 18rem;",
    url: "/project/post",
  },
};
