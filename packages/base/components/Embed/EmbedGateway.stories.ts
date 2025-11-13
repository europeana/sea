import type { Meta, StoryObj } from "@nuxtjs/storybook";

import EmbedGateway from "./EmbedGateway.vue";
const sketchfabIframe = `<div class="sketchfab-embed-wrapper"><iframe src="https://sketchfab.com/models/000/embed"></iframe></div>`;

const meta = {
  component: EmbedGateway,
} satisfies Meta<typeof EmbedGateway>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    embedCode: sketchfabIframe,
  },
};

export const UnknownProvider: Story = {
  args: {
    embedCode: '<iframe src="https://unknown.eu/embed" />',
  },
};
