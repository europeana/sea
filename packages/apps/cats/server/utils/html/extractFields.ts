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
    if ((field.items?.type || field.type) === "Symbol") {
      fieldMaxLength = 255;
    }
    const fieldSizeValidation = field.validations.find((val) => val.size);
    if (fieldSizeValidation?.size?.max) {
      fieldMaxLength = fieldSizeValidation?.size?.max;
    }

    let fieldValue;

    if ((field.items?.type || field.type) === "Text") {
      fieldValue = turndownService.turndown(section.html());
    } else {
      fieldValue = section.text();
    }

    if (fieldMaxLength && fieldValue.length > fieldMaxLength) {
      fieldValue = fieldValue.substring(0, fieldMaxLength - 1) + "…";
    }

    if (field.type === "Array") {
      if (!fields[fieldId]) {
        fields[fieldId] = [];
      }
      fields[fieldId].push(fieldValue);
    } else {
      fields[fieldId] = fieldValue;
    }
  }

  return fields;
};
