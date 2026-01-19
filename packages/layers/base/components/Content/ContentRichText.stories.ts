import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ContentRichText from "./ContentRichText.vue";

const meta = {
  component: ContentRichText,
} satisfies Meta<typeof ContentRichText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: `## This is a heading 2 title in a rich text section
Lorem ipsum __with some bold text__, and *some italic text*, and a [link](#) sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

__Sometimes simply bold text may be used as a smaller title__

That is not recommended though. For correct HTML structure (contributing to better accessibility) correct headings are applied

> A short quote

<cite>Quote citation</cite>

> A longer quote. Lorem ipsum __with some bold text__, and *some italic text*, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

### This is a heading 3 title in a rich text section
Lorem ipsum __with some bold text__, and *some italic text*, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. `,
    richTextIsCard: false,
  },
};

export const Card: Story = {
  args: {
    text: `## This is a heading 2 title in a rich text section
Lorem ipsum __with some bold text__, and *some italic text*, and a [link](#) sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

__Sometimes simply bold text may be used as a smaller title__

That is not recommended though. For correct HTML structure (contributing to better accessibility) correct headings are applied

> A short quote

<cite>Quote citation</cite>

> A longer quote. Lorem ipsum __with some bold text__, and *some italic text*, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

### This is a heading 3 title in a rich text section
Lorem ipsum __with some bold text__, and *some italic text*, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. `,
  },
};
