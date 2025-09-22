// TODO: auth or other abuse prevention
export default eventHandler(async (event) => {
  const entry = await readBody(event);

  const jobId = getRequestHeader(event, "X-Contentful-Idempotency-Key");

  await addJobToTranslateQueue({
    entry,
    jobId,
  });

  return "OK";
});
