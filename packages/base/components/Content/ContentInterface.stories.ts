import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { mocked } from "storybook/test";

import ContentInterface from "./ContentInterface.vue";
import sampleData from "../../.storybook/sample-data.js";

import VueContentfulGraphql from "@europeana/vue-contentful-graphql";

const meta = {
  component: ContentInterface,
} satisfies Meta<typeof ContentInterface>;

export default meta;
type Story = StoryObj<typeof meta>;

const ExampleDataPosts = Array.from({ length: 24 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `id${index}` },
  datePublished: `2023-01-${index + 1}`,
  name: `Entry ${index}`,
}));

const ExampleDataMetadata = Array.from({ length: 24 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `id${index}` },
  date: `2023-01-${index + 1}`,
  cats: {
    items: [{ id: "tag" }, { id: "second tag" }],
  },
}));

export const Default: Story = {
  render: () => {
    mocked(VueContentfulGraphql)
      .mockReturnValueOnce(ExampleDataMetadata)
      .mockReturnValueOnce(ExampleDataPosts);
    return {
      template: "<story />",
    };
  },
  args: {
    catBanners: sampleData.ctaBanners,
    site: "www.europeana.eu",
    contentTypes: ["blog post", "project"],
  },
};
