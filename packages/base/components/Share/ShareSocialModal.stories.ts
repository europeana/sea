import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ShareSocialModal from "./ShareSocialModal.vue";

const meta = {
  component: ShareSocialModal,
  render: (args) => ({
    components: { ShareSocialModal },
    setup() {
      return { args };
    },
    template: `<button 
class="btn btn-secondary" 
data-bs-toggle="modal" 
data-bs-target="#share-modal"
>Open modal</button>
<ShareSocialModal v-bind='args' />`,
  }),
} satisfies Meta<typeof ShareSocialModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { shareTo: ["bluesky", "facebook", "linkedin"] },
};
