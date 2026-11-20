import { describe, it, expect } from "vitest";
import { Entry, ContentType } from "contentful-management";

import { markupFields } from "@/utils/html/markupFields";

const stripSpaceFromHtml = (html: string) =>
  html.replace(/>\s+/g, ">").replace(/\s+</g, "<");

describe("markupFields", () => {
  it("should return an HTML string with marked fields", () => {
    const contentType = {
      fields: [
        {
          id: "field1",
          localized: true,
          type: "Text",
        },
        {
          id: "field2",
          localized: true,
          type: "Symbol",
        },
        {
          id: "field3",
          localized: true,
          type: "Text",
        },
      ],
    } as unknown as ContentType;

    const entry = {
      fields: {
        field1: {
          "en-GB": "# Hello, World!",
        },
        field2: {
          "en-GB": "Symbol value",
        },
        field3: {
          "en-GB": "Another text field",
        },
      },
    } as unknown as Entry;

    const locale = "en-GB";

    const expectedOutput = `
      <html>
        <head></head>
        <body>
          <article>
            <section data-ctf-field-id="field1">
              <h1>Hello, World!</h1>
            </section>
            <section data-ctf-field-id="field2">
              Symbol value
            </section>
            <section data-ctf-field-id="field3">
              <p>Another text field</p>
            </section>
          </article>
        </body>
      </html>
    `;

    const result = markupFields({ entry, contentType, locale });
    expect(stripSpaceFromHtml(result.trim())).toBe(
      stripSpaceFromHtml(expectedOutput.trim()),
    );
  });

  it("should ignore non-localised fields", () => {
    const contentType = {
      fields: [
        {
          id: "field1",
          localized: true,
          type: "Text",
        },
        {
          id: "field2",
          localized: false,
          type: "Symbol",
        },
      ],
    } as unknown as ContentType;

    const entry = {
      fields: {
        field1: {
          "en-GB": "Just a text field",
        },
        field2: {
          "en-GB": "Not localised",
        },
      },
    } as unknown as Entry;

    const locale = "en-GB";

    const expectedOutput = `
      <html>
        <head></head>
        <body>
          <article>
            <section data-ctf-field-id="field1">
              <p>Just a text field</p>
            </section>
          </article>
        </body>
      </html>
    `;

    const result = markupFields({ entry, contentType, locale });

    expect(stripSpaceFromHtml(result.trim())).toBe(
      stripSpaceFromHtml(expectedOutput.trim()),
    );
  });

  it("should ignore non-text, non-symbol fields", () => {
    const contentType = {
      fields: [
        {
          id: "field1",
          localized: true,
          type: "Symbol",
        },
        {
          id: "field2",
          localized: true,
          type: "Other",
        },
      ],
    } as unknown as ContentType;

    const entry = {
      fields: {
        field1: {
          "en-GB": "Just a text field",
        },
        field2: {
          "en-GB": "Who knows",
        },
      },
    } as unknown as Entry;

    const locale = "en-GB";

    const expectedOutput = `
      <html>
        <head></head>
        <body>
          <article>
            <section data-ctf-field-id="field1">Just a text field</section>
          </article>
        </body>
      </html>
    `;

    const result = markupFields({ entry, contentType, locale });

    expect(stripSpaceFromHtml(result.trim())).toBe(
      stripSpaceFromHtml(expectedOutput.trim()),
    );
  });

  it("should escape HTML characters in Symbol fields", () => {
    const contentType = {
      fields: [
        {
          id: "title",
          localized: true,
          type: "Symbol",
        },
      ],
    } as unknown as ContentType;

    const entry = {
      fields: {
        title: {
          "en-GB": "Tom & Jerry <3",
        },
      },
    } as unknown as Entry;

    const result = markupFields({ entry, contentType, locale: "en-GB" });

    expect(result).toContain(
      '<section data-ctf-field-id="title">Tom &amp; Jerry &lt;3</section>',
    );
  });

  it("should render Array of Symbol fields as multiple sections", () => {
    const contentType = {
      fields: [
        {
          id: "tags",
          localized: true,
          type: "Array",
          items: { type: "Symbol" },
        },
      ],
    } as unknown as ContentType;

    const entry = {
      fields: {
        tags: {
          "en-GB": ["tag1", "tag2"],
        },
      },
    } as unknown as Entry;

    const expectedOutput = `
      <html>
        <head></head>
        <body>
          <article>
            <section data-ctf-field-id="tags">tag1</section>
            <section data-ctf-field-id="tags">tag2</section>
          </article>
        </body>
      </html>
    `;

    const result = markupFields({ entry, contentType, locale: "en-GB" });

    expect(stripSpaceFromHtml(result.trim())).toBe(
      stripSpaceFromHtml(expectedOutput.trim()),
    );
  });
});
