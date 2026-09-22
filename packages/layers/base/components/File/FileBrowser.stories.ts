import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { http, HttpResponse } from "msw";
import FileBrowser from "./FileBrowser.vue";

const mockResponse = [
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
];

const meta = {
  component: FileBrowser,
} satisfies Meta<typeof FileBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.get("https://files.example.org/", () => {
        return HttpResponse.json(mockResponse);
      }),
    );
    msw.use(
      http.get("https://files.example.org/Advocacy/", () => {
        return HttpResponse.json(mockResponse[0].items);
      }),
    );
    msw.use(
      http.get(
        "https:/files.example.org/Advocacy/2016%20Update%20to%20copyright%20mandate/",
        () => {
          return HttpResponse.json(mockResponse[0].items[0].items);
        },
      ),
    );
  },
  args: {
    url: "https://files.example.org/",
  },
};
