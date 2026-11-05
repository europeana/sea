import { Job } from "bullmq";
import { extractFields } from "../../utils/html/extractFields";

export { name, processor, opts };

const name = "translate-receive";

// TODO: handle situation where this has run due to delay expiring, but no webhook
//       yet called, i.e. check for job.data.html and if absent, re-delay job
const processor = async (job: Job) => {
  const fields = extractFields(job.data);

  return {
    lang: job.data.lang,
    fields,
  };
};

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
};
