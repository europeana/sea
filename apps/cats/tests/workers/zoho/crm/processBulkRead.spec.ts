import { PassThrough } from "node:stream";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import * as unzip from "unzip-stream";
import { useFlowProducer } from "@/utils/queues";
import { useZoho } from "@/utils/zoho";
import { createSyncContactFlow } from "@/routes/zoho/contacts/index.post";
import { name, processor, opts } from "@/workers/zoho/crm/processBulkRead";

vi.mock("unzip-stream", () => ({
  Parse: vi.fn(),
}));

vi.mock("@/utils/queues", () => ({
  useFlowProducer: vi.fn(),
}));

vi.mock("@/utils/zoho", () => ({
  useZoho: vi.fn(),
}));

vi.mock("@/routes/zoho/contacts/index.post", () => ({
  createSyncContactFlow: vi.fn(),
}));

function createMockJob(data: Record<string, unknown> = {}): Job {
  return {
    id: "job-1",
    name,
    data,
  } as unknown as Job;
}

const CSV_HEADERS = [
  "Id",
  "Communities",
  "Contact_Participation",
  "Country_new",
  "Full_Name",
  "LinkedIn",
  "Modified_Time",
  "Public_email",
  "Title",
] as const;

type CsvRowInput = Partial<Record<(typeof CSV_HEADERS)[number], string>>;

function createCsvFixture(rows: CsvRowInput[]): string {
  const defaultRow: Record<(typeof CSV_HEADERS)[number], string> = {
    Id: "zoho-default",
    Communities: "Tech",
    Contact_Participation: "Speaker",
    Country_new: "United Kingdom",
    Full_Name: "Ada Lovelace",
    LinkedIn: "",
    Modified_Time: "2026-01-15T10:00:00Z",
    Public_email: "ada@example.org",
    Title: "Mathematician",
  };

  const lines = rows.map((overrides) => {
    const merged = { ...defaultRow, ...overrides };
    return CSV_HEADERS.map((header) => merged[header]).join(",");
  });

  return [CSV_HEADERS.join(","), ...lines].join("\n");
}

const flushMicrotasks = () => new Promise((resolve) => setImmediate(resolve));

describe("@/workers/zoho/crm/processBulkRead", () => {
  const mockFetchZohoBulkReadJobResult = vi.fn();
  const mockFlowProducerAddBulk = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useZoho).mockReturnValue({
      crm: {
        fetchZohoBulkReadJobResult: mockFetchZohoBulkReadJobResult,
      },
    } as unknown as ReturnType<typeof useZoho>);

    vi.mocked(useFlowProducer).mockReturnValue({
      addBulk: mockFlowProducerAddBulk.mockResolvedValue([]),
    } as unknown as ReturnType<typeof useFlowProducer>);

    vi.mocked(createSyncContactFlow).mockImplementation(
      (payload) =>
        ({
          name: "zoho-crm-sync-contact",
          queueName: "zoho-crm-sync-contact",
          data: payload,
        }) as never,
    );
  });

  it("exports expected worker metadata and options", () => {
    expect(name).toBe("zoho-crm-process-bulk-read");
    expect(opts).toEqual({
      removeOnComplete: { count: 0 },
    });
  });

  it("throws an error when Zoho bulk read result stream is missing", async () => {
    mockFetchZohoBulkReadJobResult.mockResolvedValue(null);

    const job = createMockJob({ zohoBulkReadJobId: "bulk-999" });

    await expect(processor(job)).rejects.toThrow(
      "No Zoho Bulk Read Job result",
    );
    expect(mockFetchZohoBulkReadJobResult).toHaveBeenCalledWith("bulk-999");
  });

  it("streams matching CSV entry, transforms semicolon lists, queues flows in bulk, and returns queuedCount", async () => {
    const bulkJobId = "bulk-123";
    const responseStream = new PassThrough();
    const unzipStream = new PassThrough();

    vi.mocked(unzip.Parse).mockReturnValue(unzipStream as never);
    mockFetchZohoBulkReadJobResult.mockResolvedValue(responseStream);

    const csvContent = createCsvFixture([
      {
        Id: "zoho-1",
        Communities: "Tech;History",
        Contact_Participation: "Speaker;Panelist",
        Country_new: "United Kingdom",
        Full_Name: "Ada Lovelace",
        LinkedIn: "https://linkedin.com",
        Modified_Time: "2026-01-15T10:00:00Z",
        Public_email: "ada@example.org",
        Title: "Mathematician",
      },
      {
        Id: "zoho-2",
        Communities: "",
        Contact_Participation: "",
        Country_new: "Netherlands",
        Full_Name: "Grace Hopper",
        LinkedIn: "",
        Modified_Time: "2026-01-16T12:30:00Z",
        Public_email: "grace@example.org",
        Title: "Computer Scientist",
      },
    ]);

    const job = createMockJob({ zohoBulkReadJobId: bulkJobId });
    const processorPromise = processor(job);
    await flushMicrotasks();

    const csvEntryStream = Object.assign(new PassThrough(), {
      path: `${bulkJobId}.csv`,
      autodrain: vi.fn(),
    });

    unzipStream.emit("entry", csvEntryStream);
    csvEntryStream.end(csvContent);
    unzipStream.emit("close");

    const result = await processorPromise;

    expect(result).toEqual({
      zohoBulkReadJobId: bulkJobId,
      queuedCount: 2,
    });
    expect(csvEntryStream.autodrain).not.toHaveBeenCalled();
    expect(mockFlowProducerAddBulk).toHaveBeenCalledTimes(1);

    const batchedFlows = mockFlowProducerAddBulk.mock.calls[0][0];
    expect(batchedFlows).toHaveLength(2);

    expect(createSyncContactFlow).toHaveBeenNthCalledWith(1, {
      contactId: "zoho-1",
      modified: Date.parse("2026-01-15T10:00:00Z"),
      record: {
        Id: "zoho-1",
        id: "zoho-1",
        Communities: ["Tech", "History"],
        Contact_Participation: ["Speaker", "Panelist"],
        Country_new: "United Kingdom",
        Full_Name: "Ada Lovelace",
        LinkedIn: "https://linkedin.com",
        Modified_Time: "2026-01-15T10:00:00Z",
        Public_email: "ada@example.org",
        Title: "Mathematician",
      },
    });

    expect(createSyncContactFlow).toHaveBeenNthCalledWith(2, {
      contactId: "zoho-2",
      modified: Date.parse("2026-01-16T12:30:00Z"),
      record: {
        Id: "zoho-2",
        id: "zoho-2",
        Communities: [],
        Contact_Participation: [],
        Country_new: "Netherlands",
        Full_Name: "Grace Hopper",
        LinkedIn: "",
        Modified_Time: "2026-01-16T12:30:00Z",
        Public_email: "grace@example.org",
        Title: "Computer Scientist",
      },
    });
  });

  it("flushes flows to flowProducer.addBulk in batches of 100 rows", async () => {
    const bulkJobId = "bulk-batch";
    const responseStream = new PassThrough();
    const unzipStream = new PassThrough();

    vi.mocked(unzip.Parse).mockReturnValue(unzipStream as never);
    mockFetchZohoBulkReadJobResult.mockResolvedValue(responseStream);

    const csvContent = createCsvFixture(
      Array.from({ length: 205 }, (_, index) => ({
        Id: `zoho-${index}`,
        Full_Name: `User ${index}`,
        Public_email: `user${index}@example.org`,
      })),
    );

    const job = createMockJob({ zohoBulkReadJobId: bulkJobId });
    const processorPromise = processor(job);
    await flushMicrotasks();

    const csvEntryStream = Object.assign(new PassThrough(), {
      path: `${bulkJobId}.csv`,
      autodrain: vi.fn(),
    });

    unzipStream.emit("entry", csvEntryStream);
    csvEntryStream.end(csvContent);
    unzipStream.emit("close");

    const result = await processorPromise;

    expect(result).toEqual({
      zohoBulkReadJobId: bulkJobId,
      queuedCount: 205,
    });
    expect(mockFlowProducerAddBulk).toHaveBeenCalledTimes(3);
    expect(mockFlowProducerAddBulk.mock.calls[0][0]).toHaveLength(100);
    expect(mockFlowProducerAddBulk.mock.calls[1][0]).toHaveLength(100);
    expect(mockFlowProducerAddBulk.mock.calls[2][0]).toHaveLength(5);
  });

  it("calls autodrain and ignores zip entries that do not match {zohoBulkReadJobId}.csv", async () => {
    const bulkJobId = "bulk-123";
    const responseStream = new PassThrough();
    const unzipStream = new PassThrough();

    vi.mocked(unzip.Parse).mockReturnValue(unzipStream as never);
    mockFetchZohoBulkReadJobResult.mockResolvedValue(responseStream);

    const job = createMockJob({ zohoBulkReadJobId: bulkJobId });
    const processorPromise = processor(job);
    await flushMicrotasks();

    const unrelatedEntry = Object.assign(new PassThrough(), {
      path: "metadata.json",
      autodrain: vi.fn(),
    });

    unzipStream.emit("entry", unrelatedEntry);
    unzipStream.emit("close");

    const result = await processorPromise;

    expect(result).toEqual({
      zohoBulkReadJobId: bulkJobId,
      queuedCount: 0,
    });
    expect(unrelatedEntry.autodrain).toHaveBeenCalledTimes(1);
    expect(createSyncContactFlow).not.toHaveBeenCalled();
    expect(mockFlowProducerAddBulk).not.toHaveBeenCalled();
  });

  it("destroys streams and rejects when the response stream emits an error", async () => {
    const responseStream = new PassThrough();
    const unzipStream = new PassThrough();

    vi.mocked(unzip.Parse).mockReturnValue(unzipStream as never);
    mockFetchZohoBulkReadJobResult.mockResolvedValue(responseStream);

    const job = createMockJob({ zohoBulkReadJobId: "bulk-err" });
    const processorPromise = processor(job);
    await flushMicrotasks();

    responseStream.emit("error", new Error("Upstream connection reset"));

    await expect(processorPromise).rejects.toThrow("Upstream connection reset");
    expect(responseStream.destroyed).toBe(true);
    expect(unzipStream.destroyed).toBe(true);
  });

  it("rejects when flowProducer.addBulk throws an error while processing CSV rows", async () => {
    const bulkJobId = "bulk-redis-err";
    const responseStream = new PassThrough();
    const unzipStream = new PassThrough();

    vi.mocked(unzip.Parse).mockReturnValue(unzipStream as never);
    mockFetchZohoBulkReadJobResult.mockResolvedValue(responseStream);
    mockFlowProducerAddBulk.mockRejectedValue(new Error("Redis OOM"));

    const csvContent = createCsvFixture([{ Id: "zoho-1" }]);

    const job = createMockJob({ zohoBulkReadJobId: bulkJobId });
    const processorPromise = processor(job);
    await flushMicrotasks();

    const csvEntryStream = Object.assign(new PassThrough(), {
      path: `${bulkJobId}.csv`,
      autodrain: vi.fn(),
    });

    unzipStream.emit("entry", csvEntryStream);
    csvEntryStream.end(csvContent);
    unzipStream.emit("close");
    await expect(processorPromise).rejects.toThrow("Redis OOM");
  });
});
