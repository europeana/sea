import { describe, it, expect } from "vitest";
import { ContentType } from "contentful-management";

import { extractFields } from "../../../server/utils/html/extractFields";

describe("extractFields", () => {
  const mockContentType: ContentType = {
    sys: {
      id: "exampleContentTypeId",
      type: "ContentType",
      links: {
        space: {
          sys: { id: "exampleSpaceId", type: "Link", linkType: "Space" },
        },
      },
    },
    name: "Example Content Type",
    description: "This is an example content type.",
    displayField: "title",
    fields: [
      { id: "title", type: "Symbol" },
      { id: "content", type: "Text", validations: [{ size: { max: 50 } }] },
      { id: "tags", type: "Array", items: { type: "Symbol" } },
      { id: "imageUrl", type: "Link", linkType: "Asset" },
    ],
  };

  it("should extract fields from HTML correctly", () => {
    const html = `
      <article>
        <section data-ctf-field-id="title">Cat Title</section>
        <section data-ctf-field-id="content">This is the content of the article.</section>
        <section data-ctf-field-id="tags">tag1</section>
        <section data-ctf-field-id="tags">tag2</section>
        <section data-ctf-field-id="tags">tag3</section>
        <section data-ctf-field-id="imageUrl">https://example.com/image.jpg</section>
      </article>
    `;

    const result = extractFields({ contentType: mockContentType, html });
    expect(result).toEqual({
      title: "Cat Title",
      content: "This is the content of the article.",
      tags: ["tag1", "tag2", "tag3"],
      imageUrl: "https://example.com/image.jpg",
    });
  });

  it("should truncate Symbol field if it exceeds maxLength", () => {
    const html = `
      <article>
        <section data-ctf-field-id="title">This title is way too long to fit in a Symbol field…</section>
      </article>
    `;

    const result = extractFields({ contentType: mockContentType, html });
    expect(result).toEqual({
      title: "This title is way too long to fit in a Symbol field…",
    });
  });

  it("should truncate Text field if it exceeds maxLength from validations", () => {
    const html = `
      <article>
        <section data-ctf-field-id="content">This is a very long content that should be truncated.</section>
      </article>
    `;

    const result = extractFields({ contentType: mockContentType, html });
    expect(result).toEqual({
      content: "This is a very long content that should be trunca…",
    });
  });

  it("should handle Array field type correctly", () => {
    const html = `
      <article>
        <section data-ctf-field-id="tags">tag1</section>
        <section data-ctf-field-id="tags">tag2</section>
        <section data-ctf-field-id="tags">tag3</section>
      </article>
    `;

    const result = extractFields({ contentType: mockContentType, html });
    expect(result).toEqual({
      tags: ["tag1", "tag2", "tag3"],
    });
  });

  it("should return an empty object if no fields are found", () => {
    const contentType: ContentType = {
      sys: {
        id: "emptyContentTypeId",
        type: "ContentType",
        links: {
          space: {
            sys: { id: "exampleSpaceId", type: "Link", linkType: "Space" },
          },
        },
      },
      name: "Empty Content Type",
      description: "",
      displayField: "",
      fields: [],
    };

    const html = `
      <article>
        <section data-ctf-field-id="non-existent">Some text</section>
      </article>
    `;

    const result = extractFields({ contentType, html });
    expect(result).toEqual({});
  });
});
