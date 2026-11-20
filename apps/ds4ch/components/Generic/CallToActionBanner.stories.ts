import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CallToActionBanner from "./CallToActionBanner.vue";
import sampleData from "../../.storybook/sample-data.js";

const meta = {
  component: CallToActionBanner,
} satisfies Meta<typeof CallToActionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup* and a [link](https://www.europeana.eu)!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      ...sampleData.backgroundImages[0],
      profile: {
        background: "default",
      },
    },
  },
};

export const Default2: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup* and a [link](https://www.europeana.eu)!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      ...sampleData.backgroundImages[2],
      profile: {
        background: "default",
      },
    },
  },
};

export const Highlight: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup* and a [link](https://www.europeana.eu)!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      ...sampleData.backgroundImages[1],
      profile: {
        background: "highlight",
      },
    },
  },
};

export const Alternate: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup* and a [link](https://www.europeana.eu)!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      ...sampleData.backgroundImages[2],
      profile: {
        background: "alternate",
      },
    },
  },
};
