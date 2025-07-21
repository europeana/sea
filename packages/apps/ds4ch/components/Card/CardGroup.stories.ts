import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CardGroup from "./CardGroup.vue";

const meta = {
  component: CardGroup,
} satisfies Meta<typeof CardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuoteCardGroup: Story = {
  args: {
    cards: [
      {
        quoteText:
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        attribution: "M, Museum X",
        variant: "quote",
      },
      {
        quoteText:
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        attribution: "A. B., European Commission",
        variant: "quote",
      },
      {
        quoteText:
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        attribution: "K, Ministry of Culture",
        variant: "quote",
      },
    ],
  },
};
