// TODO: auth or other abuse prevention
// TODO: validate format is "html"
export default eventHandler(async (event) => {
  const body = await readBody(event);

  const jobId = `${body.externalReference}-${body.targetLanguage}`;
  const job = await useQueue("receive").getJob(jobId);
  await job.updateData({
    ...job.data,
    html: Buffer.from(body.result, "base64").toString("utf8"),
  });
  const isDelayed = await job.isDelayed();
  if (isDelayed) {
    await job.changeDelay(0);
  }

  return "OK";
});
