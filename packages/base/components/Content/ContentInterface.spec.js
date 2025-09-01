import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentInterface from "../ContentInterface.vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {}),
}));
mockNuxtImport("useRoute", () => useRouteMock);

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

// const fullPropsData = {
//   callToAction: {
//     name: 'call to action',
//     text: 'click me!',
//     link: '#',
//     illustration: {}
//   },
//   featuredEntry: {
//     sys: { id: 'sys-id' },
//     name: 'Content title',
//     headline: 'Content headline',
//     identifier: 'content-identifier',
//     image: { url: 'https://www.example.com/image.jpg' },
//     categoriesCollection: {
//       items: [
//         { identifier: 'network' },
//         { identifier: 'postcards' }
//       ]
//     }
//   }
// };

const blogPostingListingMinimalContentfulResponse = {
  data: {
    blogPostingCollection: {
      items: [
        {
          date: "2022-02-12T08:00:00.000+01:00",
          sys: { id: "796f5YKe4b1u8uXtizSBu0" },
          cats: { items: [{ id: "3d" }, null] },
        },
      ],
    },
  },
};
const exhibitionPagesListingMinimalContentfulResponse = {
  data: {
    exhibitionPageCollection: {
      items: [
        {
          date: "2022-03-12T08:00:00.000+01:00",
          sys: { id: "1tuVL9nnfMJzptXshe3Qw8" },
          cats: { items: [{ id: "network" }] },
        },
        {
          date: "2022-01-12T08:00:00.000+01:00",
          sys: { id: "3KgVELZ48RKM4kbxJ0bYKi" },
          cats: { items: [{ id: "network" }, { id: "postcards" }] },
        },
      ],
    },
  },
};

const contentBySysIdContentfulResponse = {
  data: {
    blogPostingCollection: {
      items: [
        {
          __typename: "BlogPosting",
          sys: {
            id: "796f5YKe4b1u8uXtizSBu0",
          },
          identifier: "blog-identifier",
          name: "Blog entry",
          primaryImageOfPage: {
            image: {
              url: "https://images.ctfassets.net/i01duvb6kq77/7Jnq4yka0vfYdWKo7IV7Dc/5778788f0359b1a6a81ef1f57a260982/feature_1920Olympics.jpg",
              contentType: "image/jpeg",
            },
          },
        },
      ],
    },
    exhibitionPageCollection: {
      items: [
        {
          __typename: "ExhibitionPage",
          sys: {
            id: "1tuVL9nnfMJzptXshe3Qw8",
          },
          identifier: "the-images-that-shaped-europe",
          name: "The images that shaped Europe",
          primaryImageOfPage: {
            image: {
              url: "https://images.ctfassets.net/i01duvb6kq77/2X3RporIb4EYdG60jkKWcq/381755491830d3ef1066bd9b848900dc/hero_eu_test.jpg",
              contentType: "image/jpeg",
            },
          },
        },
        {
          __typename: "ExhibitionPage",
          sys: {
            id: "3KgVELZ48RKM4kbxJ0bYKi",
          },
          identifier: "the-jean-monnet-house",
          name: "The Jean Monnet House",
          primaryImageOfPage: {
            image: {
              url: "https://images.ctfassets.net/i01duvb6kq77/2X3RporIb4EYdG60jkKWcq/381755491830d3ef1066bd9b848900dc/hero_eu_test.jpg",
              contentType: "image/jpeg",
            },
          },
        },
      ],
    },
  },
};

const allContentMetadata = [
  {
    __typename: "ExhibitionPage",
    cats: ["network"],
    date: "2022-03-12T08:00:00.000+01:00",
    sys: {
      id: "1tuVL9nnfMJzptXshe3Qw8",
    },
  },
  {
    __typename: "BlogPosting",
    cats: ["3d"],
    date: "2022-02-12T08:00:00.000+01:00",
    sys: {
      id: "796f5YKe4b1u8uXtizSBu0",
    },
  },
  {
    __typename: "ExhibitionPage",
    cats: ["network", "postcards"],
    date: "2022-01-12T08:00:00.000+01:00",
    sys: {
      id: "3KgVELZ48RKM4kbxJ0bYKi",
    },
  },
];

const contentfulQueryMock = vi.fn((graphQL) => {
  if (graphQL.definitions?.[0]?.name?.value === "ContentBySysId") {
    return contentBySysIdContentfulResponse;
  }
  if (graphQL.definitions?.[0]?.name?.value === "BlogPostingListingMinimal") {
    return blogPostingListingMinimalContentfulResponse;
  }
  if (graphQL.definitions?.[0]?.name?.value === "exhibitionsListingMinimal") {
    return exhibitionPagesListingMinimalContentfulResponse;
  }
});

const factory = ({ data, propsData = {} } = {}) =>
  mountSuspended(ContentInterface, {
    global: {
      mocks: {
        contentful: {
          query: contentfulQueryMock,
        },
      },
    },
    data,
    propsData,
  });

describe("components/stories/ContentInterface", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Restore mocks after all?

  // describe('while the fetch state is pending', () => {
  //   it('show a loading spinner', async() => {
  //     const wrapper = factory({ mocks: { $fetchState: { pending: true } } });

  //     const spinner = wrapper.find('loadingspinner-stub');

  //     expect(spinner.exists()).toBe(true);
  //   });
  // });

  // describe('when the fetch state is complete', () => {
  //   it('does not show a loading spinner', async() => {
  //     const wrapper = factory({ mocks: { $fetchState: { pending: false } } });

  //     const spinner = wrapper.find('loadingspinner-stub');

  //     expect(spinner.exists()).toBe(false);
  //   });
  // });

  describe("data", () => {
    it("fetches all content with minimal data from Contentful", async () => {
      const wrapper = factory();

      await wrapper.vm.fetch();

      expect(
        contentfulQueryMock.calls[0].toBe("graphqlquery", {
          locale: "en-GB",
          preview: false,
          excludeSysId: "",
        }),
      ).toBe(true);
    });

    // describe('when there is a featured story', () => {
    //   it('excludes it from those fetched', async() => {
    //     const wrapper = factory({ propsData: fullPropsData });

    //     await wrapper.vm.fetch();

    //     expect(contentfulQueryMock..calls[0].toBe('graphqlquery', {
    //       locale: 'en-GB',
    //       preview: false,
    //       excludeSysId: fullPropsData.featuredContent.sys.id
    //     })).toBe(true);
    //   });
    // });

    // describe('when the type filter is set to "exhibition"', () => {
    //   it('skips fetching blogPosting type content', async() => {
    //     const wrapper = factory({ mocks: { $route: { query: { type: 'exhibition' } } } });

    //     await wrapper.vm.fetch();

    //   expect(contentfulQueryMock..calls[0].toBe('graphqlquery', {
    //       locale: 'en-GB',
    //       preview: false,
    //       excludeSysId: ''
    //     })).toBe(true);
    //   });
    // });

    // describe('when the type filter is set to "blogPosting"', () => {
    //   it('skips fetching exhibition type content', async() => {
    //     const wrapper = factory({ mocks: { $route: { query: { type: 'story' } } } });

    //     await wrapper.vm.fetch();

    //     expect(contentfulQueryMock..calls[0].toBe('graphqlquery', {
    //       locale: 'en-GB',
    //       preview: false,
    //       excludeSysId: ''
    //     })).toBe(true);
    //   });
    // });

    it("fetches page of content with full data from Contentful", async () => {
      const wrapper = factory();

      await wrapper.vm.fetch();

      expect(
        contentfulQueryMock.calls[1].toBe("graphqlquery", {
          locale: "en-GB",
          preview: false,
          limit: 24,
          ids: [
            "1tuVL9nnfMJzptXshe3Qw8",
            "796f5YKe4b1u8uXtizSBu0",
            "3KgVELZ48RKM4kbxJ0bYKi",
          ],
        }),
      ).toBe(true);
    });
  });

  describe("computed properties", () => {
    describe("selectedTags", () => {
      it("defaults to an empty array", async () => {
        const wrapper = factory();

        expect(wrapper.vm.selectedTags).toEqual([]);
      });

      it("has a selected tag when one is present in the URL", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            tags: "network",
          },
        }));
        const wrapper = factory();
        expect(wrapper.vm.selectedTags.length).toBe(1);
      });

      it("has multiple tags when present in the URL", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            tags: "network,art,manuscripts",
          },
        }));
        const wrapper = factory();

        expect(wrapper.vm.selectedTags.length).toBe(3);
      });
    });

    describe("selectedType", () => {
      it("defaults to false", () => {
        const wrapper = factory();

        expect(wrapper.vm.selectedType).toBe(false);
      });

      it('is set to "exhibition" when the type is set in the URL', () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            type: "exhibition",
          },
        }));
        const wrapper = factory();

        expect(wrapper.vm.selectedType).toBe("exhibition");
      });
    });

    describe("filteredTags", () => {
      describe("when content is filtered to a tag", () => {
        it("selects and sorts catagories that are shared with the active filter", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              tags: "network",
            },
          }));
          const wrapper = factory({ data: { allContentMetadata } });

          const filteredTags = wrapper.vm.filteredTags;

          expect(filteredTags).toEqual(["network", "postcards"]);
        });
      });
    });

    describe("relevantContentMetadata", () => {
      describe("when no tags are selected", () => {
        it("defaults to all content", async () => {
          const wrapper = factory({ data: { allContentMetadata } });

          const relevantContentMetadata = wrapper.vm.relevantContentMetadata;

          expect(relevantContentMetadata).toBe(wrapper.vm.allContentMetadata);
        });
      });

      describe("when a tag is selected", () => {
        it("only selects content which has the selected tags", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              tags: "network",
            },
          }));
          const wrapper = factory({ data: { allContentMetadata } });

          const relevantContentMetadata = wrapper.vm.relevantContentMetadata;

          const expectedContentData = allContentMetadata.filter((entry) =>
            entry.cats.includes("network"),
          );
          expect(relevantContentMetadata).toEqual(expectedContentData);
        });
      });

      describe("when a type is selected", () => {
        it("only selects content which has the selected type", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              type: "exhibition",
            },
          }));
          const wrapper = factory({ data: { allContentMetadata } });

          const relevantContentMetadata = wrapper.vm.relevantContentMetadata;

          const expectedContentData = allContentMetadata.filter(
            (entry) => entry.__typename === "ExhibitionPage",
          );
          expect(relevantContentMetadata).toEqual(expectedContentData);
        });
      });
    });

    describe("total", () => {
      it("defaults to 0", async () => {
        const wrapper = factory();

        const total = wrapper.vm.total;

        expect(total).toEqual(0);
      });

      it("is based of the relevantContentMetadata length", async () => {
        const wrapper = factory({ data: { allContentMetadata } });

        const total = wrapper.vm.total;

        expect(total).toEqual(3);
      });

      it("takes into account applied tags", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            tags: "network",
          },
        }));
        const wrapper = factory({ data: { allContentMetadata } });

        const total = wrapper.vm.total;

        expect(total).toEqual(2);
      });
    });

    describe("page", () => {
      it("defaults to 1 when no other value is in the URL", async () => {
        const wrapper = factory();

        const page = wrapper.vm.page;

        expect(page).toBe(1);
      });

      it("uses the page value from the URL when present", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            page: "3",
          },
        }));
        const wrapper = factory();

        const page = wrapper.vm.page;

        expect(page).toBe(3);
      });
    });
  });

  describe("functions", () => {
    describe("fetchContentMetadata", () => {
      it("returns all the metadata with simplified tag data", async () => {
        const wrapper = factory();

        const result = await wrapper.vm.fetchContentMetadata();

        expect(result).toEqual(allContentMetadata);
      });
    });

    describe("fetchContent", () => {
      describe("when fetching without selected tags", () => {
        it("fetches from all the contentTypes", async () => {
          const wrapper = factory({ data: { allContentMetadata } });

          await wrapper.vm.fetchContent();

          expect(
            contentfulQueryMock.calls[0].toBe("graphqlquery", {
              locale: "en-GB",
              preview: false,
              limit: 24,
              ids: [
                "1tuVL9nnfMJzptXshe3Qw8",
                "796f5YKe4b1u8uXtizSBu0",
                "3KgVELZ48RKM4kbxJ0bYKi",
              ],
            }),
          ).toBe(true);
        });

        it("orders stories by date published and inserts the CTA", async () => {
          const wrapper = factory({ data: { allContentMetadata, perPage: 2 } });
          const expected = [
            exhibitionPagesListingMinimalContentfulResponse.data
              .exhibitionPageCollection.items[0],
            blogPostingListingMinimalContentfulResponse.data
              .blogPostingCollection.items[0],
            "cta-banner",
          ];

          const fetchedContent = await wrapper.vm.fetchContent();

          expect(fetchedContent).toEqual(expected);
        });

        describe("on the second page", () => {
          it("does NOT insert a cta", async () => {
            useRouteMock.mockImplementation(() => ({
              query: {
                page: "3",
              },
            }));
            const wrapper = factory({
              data: {
                allContentMetadata,
                perPage: 2,
              },
            });

            const expected = [
              exhibitionPagesListingMinimalContentfulResponse.data
                .exhibitionPageCollection.items[1],
            ];

            const fetchedContent = await wrapper.vm.fetchContent();

            expect(fetchedContent).toEqual(expected);
          });
        });
      });

      describe("when fetching with selected tags", () => {
        it("filters the stories", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              tags: "network",
            },
          }));
          const wrapper = factory({ data: { allContentMetadata } });
          const fetchedContent = await wrapper.vm.fetchContent();

          expect(fetchedContent.length).toBe(2);
        });
      });
    });
  });

  // describe('when there is a featured story', () => {
  //   describe('and on the first page', () => {
  //     it('renders a featured story card', async() => {
  //       const wrapper = factory({ propsData: fullPropsData });

  //       expect(wrapper.find('[data-qa="featured story card"]').exists()).toBe(true);
  //     });
  //   });
  //   describe('and on the second page', () => {
  //     it('does NOT render a featured story card', async() => {
  //       const wrapper = factory({ propsData: fullPropsData, mocks: { $route: { query: { page: '2' } } } });

  //       expect(wrapper.find('[data-qa="featured story card"]').exists()).toBe(false);
  //     });
  //   });
  //   describe('and its tags match those applied', () => {
  //     it('renders a featured story card', async() => {
  //       const wrapper = factory({ propsData: fullPropsData, mocks: { $route: { query: { tags: 'cooking,postcards' } } } });

  //       expect(wrapper.find('[data-qa="featured story card"]').exists()).toBe(true);
  //     });
  //   });
  //   describe('but its tags do not match those applied', () => {
  //     it('renders a featured story card', async() => {
  //       const wrapper = factory({ propsData: fullPropsData, mocks: { $route: { query: { tags: 'sport' } } } });

  //       expect(wrapper.find('[data-qa="featured story card"]').exists()).toBe(false);
  //     });
  //   });
  //   describe('and the type filter is set to "exhibition"', () => {
  //     it('does NOT render a featured story card', async() => {
  //       const wrapper = factory({ propsData: fullPropsData, mocks: { $route: { query: { type: 'exhibition' } } } });

  //       expect(wrapper.find('[data-qa="featured story card"]').exists()).toBe(false);
  //     });
  //   });
  // });

  describe("when paginating", () => {
    it("scrolls to the top of the page", async () => {
      const wrapper = factory();
      wrapper.vm.scrollToSelector = vi.mock();

      await wrapper.vm.watch.page.call(wrapper.vm, { page: 2 });

      expect(wrapper.vm.scrollToSelector.calls[0][0]).toBe("#header");
    });
  });
});
