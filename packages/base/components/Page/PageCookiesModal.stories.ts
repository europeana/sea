import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PageCookiesModal from "./PageCookiesModal.vue";

const meta = {
  component: PageCookiesModal,
  render: (args) => ({
    components: { PageCookiesModal },
    setup() {
      return { args };
    },
    template: `<button 
  class="btn btn-secondary" 
  data-bs-toggle="modal" 
  data-bs-target="#cookie-modal"
  >Open modal</button>
  <PageCookiesModal v-bind='args' />`,
  }),
  decorators: [() => ({ template: '<div id="teleports"></div><story/>' })],
} satisfies Meta<typeof PageCookiesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
