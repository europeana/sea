import { vi } from "vitest";

global.fetch = vi.fn().mockImplementation(() => {
  return Promise.resolve(new Response());
});
