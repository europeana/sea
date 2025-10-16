import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { mocked } from "storybook/test";
import { query as queryContentful } from "@europeana/vue-contentful-graphql/query";

import ContentInterface from "./ContentInterface.vue";

const contentfulResponses = {
  BlogPostingListingMinimal: {
    data: {
      blogPostingCollection: {
        items: Array.from({ length: 24 }, (key, index) => ({
          __typename: "BlogPosting",
          sys: { id: `id${index}` },
          date: `2023-01-${index + 1}`,
          cats: {
            items: [{ id: "tag" }, { id: "second tag" }],
          },
        })),
      },
    },
  },
  ContentBySysId: {
    data: {
      blogPostingCollection: {
        items: Array.from({ length: 24 }, (key, index) => ({
          __typename: "BlogPosting",
          sys: { id: `id${index}` },
          datePublished: Date.now() + index * 3_600,
          name: `Entry ${index}`,
        })),
      },
    },
  },
};

const meta = {
  component: ContentInterface,
  beforeEach: () => {
    mocked(queryContentful).mockImplementation(
      (ast) => contentfulResponses[ast?.definitions?.[0]?.name?.value],
    );
  },
} satisfies Meta<typeof ContentInterface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    site: "www.europeana.eu",
    contentTypes: ["blog post"],
  },
};
