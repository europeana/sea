import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { http, HttpResponse } from "msw";
import DocumentBrowser from "./DocumentBrowser.vue";

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
  component: DocumentBrowser,
} satisfies Meta<typeof DocumentBrowser>;

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

export const FailedAtTop: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.get("https://files.example.org/", () => {
        return new HttpResponse(null, {
          status: 403,
        });
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

export const FailedAtNested: Story = {
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
          return new HttpResponse(null, {
            status: 403,
          });
        },
      ),
    );
  },
  args: {
    url: "https://files.example.org/",
  },
};
