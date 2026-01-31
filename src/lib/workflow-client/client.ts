import { FlowControl } from "@upstash/qstash";
import { Client } from "@upstash/workflow";

const client = new Client({});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
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
  
  console.log(`[triggerWorkflow] Starting workflow trigger - endpoint: ${endpoint}`);
  console.log(`[triggerWorkflow] Payload:`, JSON.stringify(payload));
  
  const url = `${BASE_URL}/${ENDPOINTS[endpoint]}`;
  console.log(`[triggerWorkflow] Target URL: ${url}`);
  
  const finalFlowControl: FlowControl = {
    key: "write-story-workflow",
    rate: 1,
    period: "30s",
    parallelism: 1,
    ...flowControl
  };
  console.log(`[triggerWorkflow] Flow control settings:`, JSON.stringify(finalFlowControl));
  
  try {
    const { workflowRunId, } = await client.trigger({
      url,
      body: payload,
      retries: 3,
      flowControl: finalFlowControl,
    });
    
    console.log(`[triggerWorkflow] Workflow triggered successfully - runId: ${workflowRunId}, endpoint: ${endpoint}`);
    return workflowRunId;
  } catch (error) {
    console.error(`[triggerWorkflow] Failed to trigger workflow - endpoint: ${endpoint}`, error);
    throw error;
  }
};
