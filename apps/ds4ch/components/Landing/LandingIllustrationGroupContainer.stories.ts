import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LandingIllustrationGroupContainer from "./LandingIllustrationGroupContainer.vue";
import LandingIllustrationGroup from "@europeana/sea-base-layer/components/Landing/LandingIllustrationGroup.vue";

import sampleData from "../../.storybook/sample-data.js";

const meta = {
  component: LandingIllustrationGroupContainer,
  render: (args) => ({
    components: { LandingIllustrationGroupContainer, LandingIllustrationGroup },
    setup() {
      return { args, sampleData };
    },
    template: `<LandingIllustrationGroupContainer v-bind='args'>
<LandingIllustrationGroup 
title="Section title" 
text="This text contains info. It can be __marked__. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
:illustrations="sampleData.illustrations" />
</LandingIllustrationGroupContainer>`,
  }),
} satisfies Meta<typeof LandingIllustrationGroupContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
