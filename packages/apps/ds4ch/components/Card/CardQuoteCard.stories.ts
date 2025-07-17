import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CardQuoteCard from "./CardQuoteCard.vue";

const meta = {
  component: CardQuoteCard,
} satisfies Meta<typeof CardQuoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    quoteText:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    initials: "M",
    organisation: "Museum X",
  },
};

export const NoOrganisation: Story = {
  args: {
    quoteText:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    initials: "M",
  },
};
