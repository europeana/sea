import type { Meta, StoryObj } from "@nuxtjs/storybook";

import CookiesModal from "./CookiesModal.vue";

const meta = {
  component: CookiesModal,
  render: (args) => ({
    components: { CookiesModal },
    setup() {
      return { args };
    },
    template: `<button 
  class="btn btn-secondary" 
  data-bs-toggle="modal" 
  data-bs-target="#cookie-modal"
  >Open modal</button>
  <CookiesModal v-bind='args' />`,
  }),
} satisfies Meta<typeof CookiesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
