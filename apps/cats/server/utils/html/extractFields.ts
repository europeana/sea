import { parse } from "node-html-parser";
import { ContentType } from "contentful-management";
import TurndownService from "turndown";

const turndownService = new TurndownService();

export const extractFields = ({
  contentType,
  html,
}: {
  contentType: ContentType;
  html: string;
}) => {
  const root = parse(html);
  const article = root.querySelector("article");

  const fields: Record<string, string | string[]> = {};

  if (!article) {
    return fields;
  }

  const sections = article.querySelectorAll(":scope > section");

  for (const section of sections) {
    const fieldId = section.getAttribute("data-ctf-field-id");
    const field = contentType.fields.find((field) => field.id === fieldId);

    if (field && fieldId) {
      let fieldMaxLength: number | null = null;
      if ((field.items?.type || field.type) === "Symbol") {
        fieldMaxLength = 255;
      }
      const fieldSizeValidation = (
        field.items?.validations || field.validations
      )?.find((val) => val.size);
      if (fieldSizeValidation?.size?.max) {
        fieldMaxLength = fieldSizeValidation?.size?.max;
      }

      let fieldValue: string;

      if ((field.items?.type || field.type) === "Text") {
        fieldValue = turndownService.turndown(section.innerHTML);
      } else {
        fieldValue = section.text;
      }

      if (fieldMaxLength && fieldValue.length > fieldMaxLength) {
        fieldValue = fieldValue.substring(0, fieldMaxLength - 1) + "…";
      }

      if (field.type === "Array") {
        const existing = fields[fieldId];
        if (Array.isArray(existing)) {
          existing.push(fieldValue);
        } else {
          fields[fieldId] = [fieldValue];
        }
      } else {
        fields[fieldId] = fieldValue;
      }
    }
  }

  return fields;
};
