import type { Meta, StoryObj } from "@nuxtjs/storybook";

import SmartLink from "./SmartLink.vue";

const meta = {
  component: SmartLink,
  render: (args) => ({
    components: { SmartLink },
    setup() {
      return { args };
    },
    template: "<SmartLink v-bind='args'>{{ $t('nav.about') }}</SmartLink>",
  }),
} satisfies Meta<typeof SmartLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { destination: { name: "index" } },
};

export const ExternalLink: Story = {
  args: { destination: "https://www.example.eu/" },
};

export const ExternalLinkHiddenIcon: Story = {
  args: {
    destination: "https://www.example.eu/",
    hideExternalIcon: true,
  },
};
