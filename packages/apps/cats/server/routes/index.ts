import { defineEventHandler } from "h3";

const handler = () => {
  return "OK";
};

export default defineEventHandler(handler);
