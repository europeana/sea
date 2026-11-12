import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ImageWithAttribution from "./ImageWithAttribution.vue";
import sampleData from "../../../apps/ds4ch/.storybook/sample-data.js";

const meta = {
  component: ImageWithAttribution,
} satisfies Meta<typeof ImageWithAttribution>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: sampleData.imagesWithAttribution[0].image.url,
    width: sampleData.imagesWithAttribution[0].image.width,
    height: "auto",
    alt: sampleData.imagesWithAttribution[0].image.description,
    contentType: sampleData.imagesWithAttribution[0].image.contentType,
    attribution: sampleData.imagesWithAttribution[0],
  },
};

export const CroppedFullViewport: Story = {
  args: {
    src: sampleData.imagesWithAttribution[0].image.url,
    width: "auto",
    height: "auto",
    alt: sampleData.imagesWithAttribution[0].image.description,
    contentType: sampleData.imagesWithAttribution[0].image.contentType,
    attribution: sampleData.imagesWithAttribution[0],
    maxWidth: null,
    contentfulImageCropPresets: {
      small: { w: 576, h: 896, fit: "fill" },
      medium: { w: 768, h: 1080, fit: "fill" },
      large: { w: 992, h: 1080, fit: "fill" },
      xl: { w: 1200, h: 1080, fit: "fill" },
      xxl: { w: 1400, h: 1080, fit: "fill" },
      xxxl: { w: 1880, h: 1080, fit: "fill" },
      wqhd: { w: 2520, h: 1440, fit: "fill" },
      "4k": { w: 3020, h: 1440, fit: "fill" },
      "4k+": { w: 3840, h: 2160, fit: "fill" },
    },
  },
};

export const LottieFile: Story = {
  args: {
    src: sampleData.imagesWithAttribution[1].image.url,
    width: sampleData.imagesWithAttribution[1].image.width,
    height: "auto",
    alt: sampleData.imagesWithAttribution[1].image.description,
    contentType: sampleData.imagesWithAttribution[1].image.contentType,
    attribution: sampleData.imagesWithAttribution[1],
  },
};
