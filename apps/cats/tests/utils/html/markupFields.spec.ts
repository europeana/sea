import { describe, it, expect } from "vitest";
import { Entry, ContentType } from "contentful-management";

import { markupFields } from "@/utils/html/markupFields";

const stripSpaceFromHtml = (html) =>
  html.replace(/>\s+/g, ">").replace(/\s+</g, "<");

describe("markupFields", () => {
  it("should return an HTML string with marked fields", async () => {
    const contentType: ContentType = {
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
    };

    const entry: Entry = {
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
    };

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
    const contentType: ContentType = {
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
    };

    const entry: Entry = {
      fields: {
        field1: {
          "en-GB": "Just a text field",
        },
        field2: {
          "en-GB": "Not localised",
        },
      },
    };

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
    const contentType: ContentType = {
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
    };

    const entry: Entry = {
      fields: {
        field1: {
          "en-GB": "Just a text field",
        },
        field2: {
          "en-GB": "Who knows",
        },
      },
    };

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
});
