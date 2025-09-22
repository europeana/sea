export const addJobToTranslateQueue = ({ entry, jobId }) => {
  return useQueue("translate").add(
    "entry",
    { entry },
    {
      jobId,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 10_000,
      },
    },
  );
};
