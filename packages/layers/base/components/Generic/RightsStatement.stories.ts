import type { Meta, StoryObj } from "@nuxtjs/storybook";

import RightsStatement from "./RightsStatement.vue";

const meta = {
  component: RightsStatement,
} satisfies Meta<typeof RightsStatement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PublicDomain: Story = {
  args: {
    rightsStatementUrl: "http://creativecommons.org/publicdomain/mark/1.0/",
  },
};

export const PublicDomainSimple: Story = {
  args: {
    rightsStatementUrl: "http://creativecommons.org/publicdomain/mark/1.0/",
    variant: "simple",
  },
};

export const CCBYSA: Story = {
  args: {
    rightsStatementUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};

export const CCBYSASimple: Story = {
  args: {
    rightsStatementUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    variant: "simple",
  },
};
