import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PersonSection from "./PersonSection.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: PersonSection,
} satisfies Meta<typeof PersonSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const people = [
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
  sampleData.person[0],
];

export const Default: Story = {
  args: {
    title: "People Section",
    description:
      "These are people who are featured in this section. Mutliple people may be featured in a section, they will appear in rows and columns.",
    people: people,
  },
};
