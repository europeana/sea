import { describe, expect, it } from "vitest";
import { createHttpError } from "./error";

describe("createHttpError", () => {
  it("creates & returns a Nuxt error for HTTP status code", () => {
    const err = createHttpError(404);

    expect(err.statusCode).toBe(404);
    expect(err.statusMessage).toBe("Not Found");
    expect(err.fatal).toBe(true);
  });

  it("supports overriding error properties", () => {
    const statusMessage = "oh dear";
    const err = createHttpError(404, { statusMessage });

    expect(err.statusMessage).toBe(statusMessage);
  });
});
