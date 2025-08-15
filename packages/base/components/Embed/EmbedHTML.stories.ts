import type { Meta, StoryObj } from "@nuxtjs/storybook";

import EmbedHTML from "./EmbedHTML.vue";
const sketchfabIframe = `<div class="sketchfab-embed-wrapper"> <iframe title="Incised-groove Vase Food Vessel" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/f8631ccd9ec640c6bb361fd75f959c43/embed"> </iframe> <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> <a href="https://sketchfab.com/3d-models/incised-groove-vase-food-vessel-f8631ccd9ec640c6bb361fd75f959c43?utm_medium=embed&utm_campaign=share-popup&utm_content=f8631ccd9ec640c6bb361fd75f959c43" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> Incised-groove Vase Food Vessel </a> by <a href="https://sketchfab.com/TheHuntMuseum?utm_medium=embed&utm_campaign=share-popup&utm_content=f8631ccd9ec640c6bb361fd75f959c43" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> The Hunt Museum </a> on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=f8631ccd9ec640c6bb361fd75f959c43" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a></p></div>`;

const meta = {
  component: EmbedHTML,
} satisfies Meta<typeof EmbedHTML>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    html: sketchfabIframe,
    title: "Title of the iframe",
  },
};

export const Responsive: Story = {
  args: {
    html: sketchfabIframe,
    title: "Title of the iframe",
    responsive: true,
    width: 400,
    height: 300,
  },
};
