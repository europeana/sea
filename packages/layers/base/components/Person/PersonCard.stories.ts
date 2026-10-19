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
    image: sampleData.persons[0].image,
    name: sampleData.persons[0].name,
    role: sampleData.persons[0].role,
  },
};

export const WithButtons: Story = {
  args: {
    image: sampleData.persons[0].image,
    name: sampleData.persons[0].name,
    role: sampleData.persons[0].role,
    email: sampleData.persons[0].email,
    website: sampleData.persons[0].website,
  },
};

export const WithOneButton: Story = {
  args: {
    image: sampleData.persons[0].image,
    name: sampleData.persons[0].name,
    role: sampleData.persons[0].role,
    email: sampleData.persons[0].email,
  },
};

export const WithFallbackImage: Story = {
  args: {
    name: sampleData.persons[1].name,
  },
};

export const WithFallbackImageAndButtons: Story = {
  args: {
    name: sampleData.persons[1].name,
    role: sampleData.persons[1].role,
    email: sampleData.persons[1].email,
    website: sampleData.persons[1].website,
  },
};
