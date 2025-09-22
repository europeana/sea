import * as cheerio from "cheerio";
import TurndownService from "turndown";

const turndownService = new TurndownService();

export const extractFields = ({ contentType, html }) => {
  const doc = cheerio.load(html);
  const article = doc("article").first();

  const fields = {};

  for (const element of article.children("section")) {
    const section = doc(element);
    const fieldId = section.attr("data-ctf-field-id");
    const field = contentType.fields.find((field) => field.id === fieldId);

    let fieldMaxLength = null;
    if (field.type === "Symbol") {
      fieldMaxLength = 255;
    }
    const fieldSizeValidation = field.validations.find((val) => val.size);
    if (fieldSizeValidation?.size?.max) {
      fieldMaxLength = fieldSizeValidation?.size?.max;
    }

    if (field.type === "Text") {
      fields[fieldId] = turndownService.turndown(section.html());
    } else {
      fields[fieldId] = section.text();
    }

    if (fieldMaxLength && fields[fieldId].length > fieldMaxLength) {
      fields[fieldId] = fields[fieldId].substring(0, fieldMaxLength - 1) + "…";
    }
  }

  return fields;
};
