export const addJobToReceiveQueue = ({
  contentType,
  jobId,
  lang,
  parentId,
  parentQueue,
}) => {
  return useQueue("receive").add(
    "translation",
    {
      contentType,
      lang,
    },
    {
      jobId,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 10_000,
      },
      delay: 86_400_000, // one day delay, removed by etr webhook once data is in
      parent: {
        id: parentId,
        queue: parentQueue,
      },
    },
  );
};
