import type { Meta, StoryObj } from "@nuxtjs/storybook";

import AuthoredHead from "./AuthoredHead.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: AuthoredHead,
} satisfies Meta<typeof AuthoredHead>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Title of an authored piece of content",
    subtitle: "This is a subtitle of an authored piece of content",
    description:
      "This is a description of an authored piece of content. It will substitute the subtitle when not present. Otherwise it is not displayed, but used for SEO.",
    hero: sampleData.imagesWithAttribution[0],
    contextLabel: "label",
  },
};
