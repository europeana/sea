import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CookiesSection from "./CookiesSection.vue";

const meta = {
  component: CookiesSection,
} satisfies Meta<typeof CookiesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    serviceData: {
      name: "tracking",
      title: "Tracking",
    },
  },
};

export const Purpose: Story = {
  args: {
    serviceData: {
      name: "usage",
      title: "Usage",
      services: [
        {
          name: "matomo",
          title: "Matomo",
        },
        {
          name: "google",
          title: "Google",
        },
      ],
    },
  },
};

export const AlwaysRequired: Story = {
  args: {
    serviceData: {
      name: "i18n",
      purposes: ["essential"],
      required: true,
      title: "i18n",
    },
  },
};

export const Secondary: Story = {
  args: {
    serviceData: {
      name: "tracking",
      title: "Tracking",
    },
  },
};

export const Label: Story = {
  args: {
    depth: 3,
    serviceData: {
      name: "video",
      title: "Video",
      services: [
        {
          name: "youtube",
          title: "Youtube",
        },
        {
          name: "vimeo",
          title: "Vimeo",
        },
      ],
    },
  },
};
