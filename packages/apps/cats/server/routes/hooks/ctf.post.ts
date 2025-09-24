// TODO: auth or other abuse prevention
export default eventHandler(async (event) => {
  const entry = await readBody(event);

  const jobId = getRequestHeader(event, "X-Contentful-Idempotency-Key");

  await useQueue("request").add(
    "translation",
    { entry },
    {
      jobId,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 60_000,
      },
    },
  );

  return "OK";
});
