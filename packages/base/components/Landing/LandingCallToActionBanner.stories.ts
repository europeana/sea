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
    text: "This is a call to action text _with_ *markup*!",
    link: { url: "/", text: "Click here" },
  },
};

export const DefaultWithBackground: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup*!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      image: {
        url: "https://images.ctfassets.net/i01duvb6kq77/563nWMAsbl2t3M7oe98OrH/3d956ec737a2f6ffa43d22a7e86f3879/DS4CH_Banner_Yellow.svg",
        width: 890,
        height: 724,
      },
    },
  },
};

export const DefaultWithPrimaryButton: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup*!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      image: {
        url: "https://images.ctfassets.net/i01duvb6kq77/2YNOyoyhclcdaybf0aWJ9/f3cf3dd71d3ec2737b09f069de84e575/DS4CH_Banner_Grey.svg",
        width: 890,
        height: 724,
      },
    },
    buttonVariant: "primary",
  },
};

export const secondary: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup*!",
    link: { url: "/", text: "Click here" },
    backgroundImage: {
      image: {
        url: "https://images.ctfassets.net/i01duvb6kq77/1KOArDsW3ol7e8XgslNqaD/b7a76cbb9b8f26282c481b8e25f4ae1d/DS4CH_Banner_Black.svg",
        width: 890,
        height: 724,
      },
    },
    variant: "secondary",
  },
};
