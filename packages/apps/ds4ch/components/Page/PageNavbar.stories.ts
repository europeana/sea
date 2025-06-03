import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageNavbar from './PageNavbar.vue';

const meta = {
  component: PageNavbar,
} satisfies Meta<typeof PageNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
