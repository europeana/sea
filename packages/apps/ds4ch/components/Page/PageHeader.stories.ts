import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageHeader from './PageHeader.vue';

const meta = {
  component: PageHeader,
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
