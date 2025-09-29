import * as cheerio from "cheerio";
import { marked } from "marked";

export const markupFields = ({ entry, contentType, locale = "en-GB" }) => {
  const translatableFields = contentType.fields.filter(
    (field) =>
      field.localized &&
      ["Symbol", "Text"].includes(field.items?.type || field.type),
  );

  const doc = cheerio.load("");
  const article = doc("<article></article>");

  for (const field of translatableFields) {
    for (const fieldValue of [].concat(
      entry.fields[field.id]?.[locale] || "",
    )) {
      const section = doc("<section></section>");
      section.attr("data-ctf-field-id", field.id);

      if (field.items?.type || field.type === "Text") {
        // assume markdown, and convert to html
        section.html(marked.parse(fieldValue));
      } else {
        section.text(fieldValue);
      }

      article.append(section);
    }
  }

  doc("body").append(article);

  return doc.html();
};
