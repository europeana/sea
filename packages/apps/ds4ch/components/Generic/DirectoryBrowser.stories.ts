import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DirectoryBrowser from "./DirectoryBrowser.vue";

const meta = {
  component: DirectoryBrowser,
} satisfies Meta<typeof DirectoryBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    directories: [
      {
        name: "Advocacy",
        type: "directory",
        mtime: "Thu, 23 May 2024 14:26:05 GMT",
        items: [
          {
            name: "2016 Update to copyright mandate",
            type: "directory",
            mtime: "Mon, 27 Jul 2020 13:31:14 GMT",
            items: [
              {
                name: "cwgsubgroupreviewingthecopyrightmandatebriefv1.pdf",
                type: "file",
                mtime: "Mon, 11 Sep 2023 23:20:04 GMT",
                size: 70725,
              },
            ],
          },
          {
            name: "Europeana Advocacy Framework.doc",
            type: "file",
            mtime: "Mon, 11 Sep 2023 23:20:04 GMT",
            size: 145408,
          },
        ],
      },
    ],
  },
};
