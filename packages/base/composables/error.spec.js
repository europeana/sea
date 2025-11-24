import { describe, expect, it } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createHttpError } from "./error";

mockNuxtImport("useNuxtApp", () => {
  return () => ({
    $i18n: {
      t: (key) => key,
      te: () => true,
    },
  });
});

describe("createHttpError", () => {
  it("creates & returns a Nuxt error for HTTP status code", () => {
    const err = createHttpError(404);

    expect(err.statusCode).toBe(404);
    expect(err.statusMessage).toBe("errors.http.404");
    expect(err.fatal).toBe(true);
  });

  it("supports overriding error properties", () => {
    const statusMessage = "oh dear";
    const err = createHttpError(404, { statusMessage });

    expect(err.statusMessage).toBe(statusMessage);
  });
});
