import { FlowControl } from "@upstash/qstash";
import { Client } from "@upstash/workflow";

const client = new Client({});

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:3000`;

const ENDPOINTS = {
  writeStory: "api/stories",
  generateStory: "api/stories/generate",
};

export const triggerWorkflow = async <T>(
  endpoint: keyof typeof ENDPOINTS,
  payload: T,
  flowControl?: FlowControl
): Promise<string> => {
  const url = `${BASE_URL}/${ENDPOINTS[endpoint]}`;
  const { workflowRunId } = await client.trigger({
    url,
    body: payload,
    retries: 3,
    flowControl: {
      key: "write-story-workflow",
      rate: 1,
      period: "1m",
      parallelism: 1,
      ...flowControl
    },
  });
  return workflowRunId;
};
