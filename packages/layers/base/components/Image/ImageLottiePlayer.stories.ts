import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ImageLottiePlayer from "./ImageLottiePlayer.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: ImageLottiePlayer,
} satisfies Meta<typeof ImageLottiePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: sampleData.imagesWithAttribution[1].image.url,
  },
};
