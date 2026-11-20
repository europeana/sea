import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import TextInterpolation from "./TextInterpolation.vue";

describe("TextInterpolation", () => {
  it("replaces placeholders in text with content of named slots", () => {
    const component = {
      components: {
        TextInterpolation,
      },
      template: `
        <TextInterpolation
          text="The {thing} is {property}."
        >
          <template #thing>sky</template>
          <template #property>blue</template>
        </TextInterpolation>
      `,
    };

    const wrapper = mount(component);

    expect(wrapper.html()).toBe("<span>The sky is blue.</span>");
  });
});
