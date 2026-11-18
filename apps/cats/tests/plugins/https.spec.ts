import https from "node:https";
import { afterEach, describe, expect, it } from "vitest";
import type { NitroApp } from "nitropack";

import httpsPlugin from "@/plugins/https";

describe("@/plugins/https", () => {
  const originalGlobalAgent = https.globalAgent;

  afterEach(() => {
    https.globalAgent = originalGlobalAgent;
  });

  it("replaces https.globalAgent with keepAlive disabled", () => {
    httpsPlugin({} as NitroApp);

    expect(https.globalAgent).toBeInstanceOf(https.Agent);
    expect(https.globalAgent.keepAlive).toBe(false);
  });
});
