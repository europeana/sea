import { describe, expect, it } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createHttp404Error } from "./error";

mockNuxtImport("useI18n", () => {
  return () => ({
    t: (key) => key,
  });
});

describe("createHttp404Error", () => {
  it("creates & returns a Nuxt error for HTTP 404", () => {
    const err = createHttp404Error();

    expect(err.statusCode).toBe(404);
    expect(err.statusMessage).toBe("errors.http.404");
    expect(err.fatal).toBe(true);
  });

  it("supports overriding error properties", () => {
    const statusMessage = "oh dear";
    const err = createHttp404Error({ statusMessage });

    expect(err.statusMessage).toBe(statusMessage);
  });
});
