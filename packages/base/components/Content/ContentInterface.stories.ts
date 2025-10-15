import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { graphql, HttpResponse } from "msw";

import ContentInterface from "./ContentInterface.vue";
import sampleData from "../../.storybook/sample-data.js";

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
  args: {
    catBanners: sampleData.ctaBanners,
    site: "www.europeana.eu",
    contentTypes: ["blog post", "project"],
  },
  params: {
    msw: {
      handlers: [
        graphql.query("BlogPostingListingMinimal", () => {
          return HttpResponse.json({
            data: {
              blogPostingCollection: {
                ...ExampleDataPosts,
              },
            },
          });
        }),
        graphql.query("Categories", () => {
          return HttpResponse.json({
            data: {
              categoryCollection: {
                ...ExampleDataMetadata,
              },
            },
          });
        }),
      ],
      //   handlers: [
      //     http.post('https://graphql.contentful.com/content/v1/spaces//environments/master', ({ request }) => {
      //       const url = new URL(request.url)
      //       const query = url.searchParams.get('_query')
      //       if (query === 'BlogPostingListingMinimal') {
      //         return HttpResponse.json(ExampleDataPosts);
      //       } else if (query === 'Categories') {
      //         return HttpResponse.json(ExampleDataMetadata);
      //       }
      //     }),
      //   ],
    },
  },
};
