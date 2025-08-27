import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ShareSocialLink from "./ShareSocialLink.vue";

const testProps = {
  network: "bluesky",
};

describe("components/Share/ShareSocialLink", () => {
  it("renders a share link for the network", () => {
    const wrapper = shallowMount(ShareSocialLink, { props: testProps });

    const link = wrapper.find("nuxt-link-stub");

    expect(link.attributes("to")).toEqual(wrapper.vm.allNetworks.bluesky.url);
  });
});
