// TODO: auth or other abuse prevention
export default eventHandler(async (event) => {
  const queue = useQueues(useRuntimeConfig(event)).translate;

  const entry = await readBody(event);

  const key = getRequestHeader(event, "X-Contentful-Idempotency-Key");

  queue.add(
    "entry",
    { entry },
    {
      jobId: key,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 10_000,
      },
    },
  );

  return "OK";
});
