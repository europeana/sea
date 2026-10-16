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
    name: sampleData.person[0].name,
    role: sampleData.person[0].role,
  },
};

export const WithButtons: Story = {
  args: {
    image: sampleData.person[0].image,
    name: sampleData.person[0].name,
    role: sampleData.person[0].role,
    email: sampleData.person[0].email,
    linkedIn: sampleData.person[0].website,
  },
};

export const WithOneButton: Story = {
  args: {
    image: sampleData.person[0].image,
    name: sampleData.person[0].name,
    role: sampleData.person[0].role,
    email: sampleData.person[0].email,
  },
};

export const WithFallbackImage: Story = {
  args: {
    name: "Mr. E. Persoon",
  },
};

export const WithFallbackImageAndButtons: Story = {
  args: {
    name: "Mr. E. Persoon",
    role: "Enigma",
    email: "mr.e@example.org",
    linkedIn: "https://www.linkedin.com/mr.e",
  },
};
