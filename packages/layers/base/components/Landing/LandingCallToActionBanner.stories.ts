import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LandingCallToActionBanner from "./LandingCallToActionBanner.vue";

const meta = {
  component: LandingCallToActionBanner,
} satisfies Meta<typeof LandingCallToActionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup* and a [link](https://www.europeana.eu)!",
    link: { url: "/", text: "Click here" },
  },
};

export const HighlightBackground: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup* and a [link](https://www.europeana.eu)!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      profile: {
        background: "highlight",
      },
    },
  },
};
