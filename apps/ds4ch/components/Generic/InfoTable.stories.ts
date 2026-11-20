import type { Meta, StoryObj } from "@nuxtjs/storybook";

import InfoTable from "./InfoTable.vue";

const meta = {
  component: InfoTable,
} satisfies Meta<typeof InfoTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tableData: [
      {
        label: "Label of a key value pair table row",
        url: "https://www.example.eu",
        icon: "ic-download",
        value: "Value with a link and icon",
      },
      {
        label: "Label of a key value pair table row",
        url: "https://www.example.eu",
        value: "Value with a link",
      },
      {
        label: "Another label of a key value pair table row",
        value: "Value without link nor icon",
      },
    ],
  },
};
