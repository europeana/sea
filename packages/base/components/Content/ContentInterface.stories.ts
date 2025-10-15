import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ContentInterface from "./ContentInterface.vue";

const meta = {
  component: ContentInterface,
} satisfies Meta<typeof ContentInterface>;

export default meta;
type Story = StoryObj<typeof meta>;

const ExampleDataPosts = Array.from({ length: 24 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `id${index}` },
  datePublished: Date.now() + index * 3_600,
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
  render: (args) => ({
    setup() {
      provide("$contentful", {
        query(ast) {
          switch (ast?.definitions?.[0]?.name?.value) {
            case "BlogPostingListingMinimal":
              return {
                data: { blogPostingCollection: { items: ExampleDataMetadata } },
              };
              break;
            case "ContentBySysId":
              return {
                data: { blogPostingCollection: { items: ExampleDataPosts } },
              };
              break;
          }
        },
      });

      return { args };
    },
    components: { ContentInterface },
    template: '<ContentInterface v-bind="args" />',
  }),
  args: {
    site: "www.europeana.eu",
    contentTypes: ["blog post"],
  },
};
