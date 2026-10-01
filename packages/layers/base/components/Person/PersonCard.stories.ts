import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PersonCard from "./PersonCard.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: PersonCard,
} satisfies Meta<typeof PersonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: sampleData.person[0].image,
    name: "Frida Kahlo",
    role: "painter",
  },
};
