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
    image: sampleData.people[0].image,
    name: sampleData.people[0].name,
    role: sampleData.people[0].role,
  },
};

export const WithButtons: Story = {
  args: {
    image: sampleData.people[0].image,
    name: sampleData.people[0].name,
    role: sampleData.people[0].role,
    email: sampleData.people[0].email,
    website: sampleData.people[0].website,
  },
};

export const WithOneButton: Story = {
  args: {
    image: sampleData.people[0].image,
    name: sampleData.people[0].name,
    role: sampleData.people[0].role,
    email: sampleData.people[0].email,
  },
};

export const WithFallbackImage: Story = {
  args: {
    name: sampleData.people[1].name,
  },
};

export const WithFallbackImageAndButtons: Story = {
  args: {
    name: sampleData.people[1].name,
    role: sampleData.people[1].role,
    email: sampleData.people[1].email,
    website: sampleData.people[1].website,
  },
};
