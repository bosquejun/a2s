import { Client } from "@upstash/workflow";

const client = new Client({
  baseUrl: "http://localhost:8080",
  token: "eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=",
});

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:3000`

  const ENDPOINTS = {
    writeStory: "api/stories",
  }

export const triggerWorkflow = async <T>(endpoint: keyof typeof ENDPOINTS, payload: T): Promise<string> => {
  const url = `${BASE_URL}/${ENDPOINTS[endpoint]}`;
  const { workflowRunId } = await client.trigger({
    url,
    body: payload,
    retries:3,
  });
  return workflowRunId;
};