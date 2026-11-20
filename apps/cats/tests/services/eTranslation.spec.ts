import { describe, it, expect, vi, beforeEach } from "vitest";
import fetch from "node-fetch-native";
import { useRuntimeConfig } from "nitropack/runtime";
import { requestTranslation } from "@/services/eTranslation";

describe("eTranslation service", () => {
  const mockJson = vi.fn();

  const baseConfig = {
    eTranslation: {
      url: "https://example.org",
      username: "eu-user",
      password: "secret-password",
      deliveries: "https://example.org",
      notifications: {
        failure: "https://example.org",
        success: "https://example.org",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRuntimeConfig).mockReturnValue(
      structuredClone(baseConfig) as ReturnType<typeof useRuntimeConfig>,
    );

    mockJson.mockResolvedValue({ requestId: 123456 });
    vi.mocked(fetch).mockResolvedValue({
      json: mockJson,
    } as unknown as Awaited<ReturnType<typeof fetch>>);
  });

  it("sends a properly formatted translation request using configured URLs", async () => {
    const html = "<p>Hello Europeana</p>";
    const expectedBase64Html = Buffer.from(html).toString("base64");
    const expectedBasicAuth = Buffer.from("eu-user:secret-password").toString(
      "base64",
    );

    const result = await requestTranslation({
      externalReference: "entry-42:title",
      html,
      targetLanguages: ["FR", "DE"],
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0];

    expect(calledUrl).toBe("https://example.org");
    expect(calledInit?.method).toBe("post");
    expect(calledInit?.headers).toEqual({
      authorization: `Basic ${expectedBasicAuth}`,
      "content-type": "application/json",
    });

    const parsedBody = JSON.parse(calledInit?.body as string);
    expect(parsedBody).toEqual({
      callerInformation: {
        externalReference: "entry-42:title",
      },
      documentToTranslate: {
        document: {
          format: "html",
          content: expectedBase64Html,
        },
      },
      sourceLanguage: "EN",
      targetLanguages: ["FR", "DE"],
      deliveries: {
        http: "https://example.org",
      },
      notifications: {
        failure: {
          http: "https://example.org",
        },
        success: {
          http: "https://example.org",
        },
      },
    });

    expect(result).toEqual({ requestId: 123456 });
  });

  it("falls back to the default EC endpoint and uses explicit sourceLanguage when url is empty", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      eTranslation: {
        ...baseConfig.eTranslation,
        url: "",
      },
    } as ReturnType<typeof useRuntimeConfig>);

    await requestTranslation({
      externalReference: "entry-99",
      html: "<h1>Bonjour</h1>",
      sourceLanguage: "FR",
      targetLanguages: ["EN", "NL"],
    });

    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0];
    expect(calledUrl).toBe(
      "https://language-tools.ec.europa.eu/etranslation/api/askTranslate",
    );

    const parsedBody = JSON.parse(calledInit?.body as string);
    expect(parsedBody.sourceLanguage).toBe("FR");
    expect(parsedBody.targetLanguages).toEqual(["EN", "NL"]);
  });

  it("omits failure or success notification keys when not configured", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      eTranslation: {
        ...baseConfig.eTranslation,
        notifications: {
          failure: "",
          success: "https://example.org",
        },
      },
    } as ReturnType<typeof useRuntimeConfig>);

    await requestTranslation({
      externalReference: "entry-55",
      html: "<p>Test</p>",
      targetLanguages: ["ES"],
    });

    const [, calledInit] = vi.mocked(fetch).mock.calls[0];
    const parsedBody = JSON.parse(calledInit?.body as string);

    expect(parsedBody.notifications).toEqual({
      success: {
        http: "https://example.org",
      },
    });
    expect(parsedBody.notifications).not.toHaveProperty("failure");
  });

  it("omits both notification keys when neither failure nor success is configured", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      eTranslation: {
        ...baseConfig.eTranslation,
        notifications: {},
      },
    } as ReturnType<typeof useRuntimeConfig>);

    await requestTranslation({
      externalReference: "entry-56",
      html: "<p>Test</p>",
      targetLanguages: ["IT"],
    });

    const [, calledInit] = vi.mocked(fetch).mock.calls[0];
    const parsedBody = JSON.parse(calledInit?.body as string);

    expect(parsedBody.notifications).toEqual({});
  });

  it("propagates network or JSON parsing errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network timeout"));

    await expect(
      requestTranslation({
        externalReference: "entry-err",
        html: "<p>Fail</p>",
        targetLanguages: ["DE"],
      }),
    ).rejects.toThrow("Network timeout");
  });
});
