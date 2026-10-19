import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PersonSection from "./PersonSection.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: PersonSection,
} satisfies Meta<typeof PersonSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const people = Array.from({ length: 6 }, () => sampleData.persons[0]);

export const Default: Story = {
  args: {
    title: "People Section",
    description:
      "These are _people_ who are featured in this section. Mutliple _people_ may be featured in a section, they will appear in rows and columns.",
    people: people,
  },
};

export const H4Title: Story = {
  args: {
    title: "People Section",
    titleTag: "h4",
    description:
      "These are _people_ who are featured in this section. Mutliple _people_ may be featured in a section, they will appear in rows and columns.",
    people: people,
  },
};

export const HiddenButtons: Story = {
  args: {
    title: "People Section",
    description:
      "These are _people_ who are featured in this section. Mutliple _people_ may be featured in a section, they will appear in rows and columns.",
    people: people,
    showContactButtons: false,
  },
};
