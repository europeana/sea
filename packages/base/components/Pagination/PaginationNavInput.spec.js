import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { config, shallowMount } from "@vue/test-utils";
import PaginationNavInput from "./PaginationNavInput.vue";

const { mockRoute, mockRouterPush } = vi.hoisted(() => ({
  mockRoute: vi.fn(),
  mockRouterPush: vi.fn(() => {}),
}));
mockNuxtImport("useRoute", () => mockRoute);

mockNuxtImport("useRouter", () => {
  return () => ({
    push: mockRouterPush,
  });
});

const factory = ({ props } = {}) =>
  shallowMount(PaginationNavInput, {
    props,
    global: {
      mocks: {
        $t: (val) => val,
      },
    },
  });

describe("components/generic/PaginationNavInput", () => {
  beforeAll(() => {
    config.global.renderStubDefaultSlot = true;
  });

  beforeEach(() => {
    mockRoute.mockReturnValue({ query: {} });
  });

  afterEach(() => {
    mockRoute.mockReset();
    mockRouterPush.mockReset();
  });

  afterAll(() => {
    config.global.renderStubDefaultSlot = false;
  });

  describe("template", () => {
    describe("previous button", () => {
      it("is disabled on the first page", () => {
        const wrapper = factory({
          props: { totalItems: 240, perPage: 24 },
        });

        const prevButton = wrapper.find('[data-qa="prev button"]');

        expect(prevButton.attributes().class).toContain("disabled");
      });

      it("displays text by default", () => {
        const wrapper = factory();

        const prevButton = wrapper.find('[data-qa="prev button"]');

        expect(prevButton.text()).toBe("pagination.previous");
      });

      it("omits text if `buttonText` prop is `false`", () => {
        const wrapper = factory({
          props: { buttonText: false },
        });

        const prevButton = wrapper.find('[data-qa="prev button"]');

        expect(prevButton.text()).toBe("");
      });

      it("displays icon by default", () => {
        const wrapper = factory();

        const prevButtonIcon = wrapper.find('[data-qa="prev button icon"]');

        expect(prevButtonIcon.exists()).toBe(true);
      });

      it("omits icon if `buttonIconClass` prop is `null`", () => {
        const wrapper = factory({
          props: { buttonIconClass: null },
        });

        const prevButtonIcon = wrapper.find('[data-qa="prev button icon"]');

        expect(prevButtonIcon.exists()).toBe(false);
      });
    });

    describe("next button", () => {
      it("is disabled on the last page", () => {
        mockRoute.mockReturnValue({ query: { page: 10 } });
        const wrapper = factory({
          props: { totalItems: 240, perPage: 24 },
        });

        const nextButton = wrapper.find('[data-qa="next button"]');

        expect(nextButton.attributes().class).toContain("disabled");
      });

      it("displays text by default", () => {
        const wrapper = factory();

        const nextButton = wrapper.find('[data-qa="next button"]');

        expect(nextButton.text()).toBe("pagination.next");
      });

      it("omits text if `buttonText` prop is `false`", () => {
        const wrapper = factory({
          props: { buttonText: false },
        });

        const nextButton = wrapper.find('[data-qa="next button"]');

        expect(nextButton.text()).toBe("");
      });

      it("displays icon by default", () => {
        const wrapper = factory();

        const nextButtonIcon = wrapper.find('[data-qa="next button icon"]');

        expect(nextButtonIcon.exists()).toBe(true);
      });

      it("omits icon if `buttonIconClass` prop is `null`", () => {
        const wrapper = factory({
          props: { buttonIconClass: null },
        });

        const nextButtonIcon = wrapper.find('[data-qa="next button icon"]');

        expect(nextButtonIcon.exists()).toBe(false);
      });
    });

    describe("page input", () => {
      it("is present by default", () => {
        const wrapper = factory();

        const paginationInput = wrapper.find('[data-qa="pagination input"]');

        expect(paginationInput.exists()).toBe(true);
      });

      it("is not present if `pageInput` prop is `false`", () => {
        const wrapper = factory({
          props: { pageInput: false },
        });

        const paginationInput = wrapper.find('[data-qa="pagination input"]');

        expect(paginationInput.exists()).toBe(false);
      });

      describe("change event", () => {
        it("triggers a redirect to the new page", async () => {
          const wrapper = factory({
            props: { totalItems: 240, perPage: 24 },
          });

          const paginationInput = wrapper.find('[data-qa="pagination input"]');
          await paginationInput.setValue(2);

          expect(mockRouterPush).toHaveBeenCalled();
        });

        it("does nothing if page is blank", async () => {
          const wrapper = factory({
            props: { totalItems: 240, perPage: 24 },
          });

          const paginationInput = wrapper.find('[data-qa="pagination input"]');
          await paginationInput.setValue("");

          expect(mockRouterPush).not.toHaveBeenCalled();
        });
      });
    });

    describe("progress indicator", () => {
      it("is by default not present", () => {
        const wrapper = factory();

        const paginationInput = wrapper.find('[data-qa="pagination progress"]');

        expect(paginationInput.exists()).toBe(false);
      });

      it("is present, and shows progress, if `progress` prop is `true`", () => {
        mockRoute.mockReturnValue({ query: { page: 2 } });
        const wrapper = factory({
          props: { perPage: 1, progress: true, totalItems: 3 },
        });

        const paginationInput = wrapper.find('[data-qa="pagination progress"]');

        expect(paginationInput.text()).toBe("2/3");
      });
    });
  });

  // TODO: stop using wrapper.vm
  describe("computed", () => {
    describe("totalPages", () => {
      it("calculates total number of pages", () => {
        const wrapper = factory({
          props: { totalItems: 240, perPage: 24 },
        });

        expect(wrapper.vm.totalPages).toBe(10);
      });
    });
  });

  describe("methods", () => {
    describe("linkGen", () => {
      it("returns an object with the new pageNo", () => {
        const wrapper = factory({
          props: { totalItems: 240, perPage: 24 },
        });

        const generatedLink = wrapper.vm.linkGen(2);
        expect(generatedLink).toEqual({ query: { page: 2 } });
      });

      it("removes any params from paginated links that have been specified by the excludeParams prop", () => {
        mockRoute.mockReturnValue({
          query: { page: 1, remove: "exists", maintain: "exists" },
        });
        const wrapper = factory({
          props: { totalItems: 240, perPage: 24, excludeParams: ["remove"] },
        });

        const generatedLink = wrapper.vm.linkGen(2);
        expect(generatedLink).toEqual({
          query: { page: 2, maintain: "exists" },
        });
      });
    });
  });
});
