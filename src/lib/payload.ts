import "server-only";

import configPromise from "@payload-config";
import { getPayload as getPayloadInstance, type Payload } from "payload";

/**
 * Shared, memoized Payload Local API client. Use this anywhere on the server
 * (pages, route handlers, workflows, AI ingestion) instead of touching the
 * database directly.
 */
let cached: Promise<Payload> | null = null;

export function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayloadInstance({ config: configPromise });
  }
  return cached;
}
