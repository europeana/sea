import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ContentFeaturedCard from "./ContentFeaturedCard.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: ContentFeaturedCard,
} satisfies Meta<typeof ContentFeaturedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Title of featured content",
    subTitle: "Featured",
    image: sampleData.imagesWithAttribution[0].image,
    text: "Text on a featured content card",
    url: "/",
  },
};

export const News: Story = {
  args: {
    title: "News post title",
    image: sampleData.imagesWithAttribution[0].image,
    text: "Created August, 10",
    url: "/news/post",
  },
};

export const Project: Story = {
  args: {
    title: "Project title",
    image: sampleData.imagesWithAttribution[0].image,
    text: "Headline of a project",
    url: "/project/post",
  },
};
