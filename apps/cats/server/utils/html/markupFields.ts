import { HTMLElement } from "node-html-parser";
import { marked } from "marked";
import { Entry, ContentType } from "contentful-management";

export const markupFields = ({
  entry,
  contentType,
  locale = "en-GB",
}: {
  entry: Entry;
  contentType: ContentType;
  locale?: string;
}) => {
  const translatableFields = contentType.fields.filter(
    (field) =>
      Object.keys(entry.fields).includes(field.id) &&
      // only include fields with a value in the source locale
      Object.keys(entry.fields[field.id]).includes(locale) &&
      field.localized &&
      ["Symbol", "Text"].includes(field.items?.type || field.type),
  );

  const article = new HTMLElement("article", {});

  for (const field of translatableFields) {
    for (const fieldValue of [].concat(
      entry.fields[field.id]?.[locale] || "",
    )) {
      const section = new HTMLElement("section", {});
      section.setAttribute("data-ctf-field-id", field.id);

      if ((field.items?.type || field.type) === "Text") {
        // assume markdown, and convert to html
        section.innerHTML = marked.parse(fieldValue, { async: false });
      } else {
        section.textContent = fieldValue;
      }

      article.appendChild(section);
    }
  }

  return `<html><head></head><body>${article.toString()}</body></html>`;
};
