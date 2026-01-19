import type { Meta, StoryObj } from "@nuxtjs/storybook";

import InfoCard from "./InfoCard.vue";

const meta = {
  component: InfoCard,
} satisfies Meta<typeof InfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    info: "9,000 +",
    label: "Card label",
  },
};
export const WithALink: Story = {
  args: {
    url: "https://www.europeana.eu",
    info: "9,000 +",
    label: "Card label with link",
  },
};
export const DarkVariant: Story = {
  args: {
    url: "https://www.europeana.eu",
    info: "9,000 +",
    label: "Card label",
    variant: "dark",
  },
};
export const ForThe3DIcon: Story = {
  args: {
    info: "9,000 +",
    image: "ic-3d",
    label: "3D",
  },
};
export const ForTheVideoIcon: Story = {
  args: {
    info: "9,000 +",
    image: "ic-video",
    label: "Video",
  },
};
export const ForTheSoundIcon: Story = {
  args: {
    info: "9,000 +",
    image: "ic-sound",
    label: "Sound",
  },
};
export const ForTheTextIcon: Story = {
  args: {
    info: "9,000 +",
    image: "ic-text",
    label: "Text",
  },
};
export const ForTheImageIcon: Story = {
  args: {
    info: "9,000 +",
    image: "ic-image",
    label: "Image",
  },
};
