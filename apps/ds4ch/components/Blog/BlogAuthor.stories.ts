import type { Meta, StoryObj } from "@nuxtjs/storybook";

import BlogAuthor from "./BlogAuthor.vue";

const meta = {
  component: BlogAuthor,
} satisfies Meta<typeof BlogAuthor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Jane Doe",
    url: "#",
    organisation: "Museum of fine arts",
  },
};

export const NameOnly: Story = {
  args: {
    name: "Jane Doe",
  },
};

export const WithLink: Story = {
  args: {
    name: "Jane Doe",
    url: "#",
  },
};

export const WithOrganistaion: Story = {
  args: {
    name: "Jane Doe",
    organisation: "Museum of fine arts",
  },
};
