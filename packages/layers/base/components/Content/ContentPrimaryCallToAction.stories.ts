import type { Meta, StoryObj } from "@nuxtjs/storybook";

import ContentPrimaryCallToAction from "./ContentPrimaryCallToAction.vue";

const meta = {
  component: ContentPrimaryCallToAction,
} satisfies Meta<typeof ContentPrimaryCallToAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup*!",
    link: { url: "/", text: "Click here" },
    buttonVariant: "btn-primary icon-chevron",
  },
};

export const SecondaryButtonStyle: Story = {
  args: {
    title: "Call to action name",
    text: "This is a call to action text _with_ *markup*!",
    link: { url: "/", text: "Click here" },
    buttonVariant: "btn-secondary icon-chevron",
  },
};
