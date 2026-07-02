"use client";

import { Button, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

/**
 * Renders on the Facebook Connection global. Reads the connection status from
 * the form state (no extra request) and shows either a "Connect Facebook Page"
 * button (a server-side redirect into Facebook's OAuth dialog) or the connected
 * Page with a Disconnect action.
 */
export function FacebookConnectButton() {
  const connected = useFormFields(
    ([fields]) => fields?.connected?.value as boolean | undefined
  );
  const pageName = useFormFields(
    ([fields]) => fields?.pageName?.value as string | undefined
  );
  const [busy, setBusy] = useState(false);

  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const error = params?.get("fbError");
  const justConnected = params?.get("fbConnected");

  async function disconnect() {
    setBusy(true);
    try {
      await fetch("/api/facebook/disconnect", { method: "POST" });
      window.location.assign(window.location.pathname);
    } catch {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {error && (
        <p style={{ color: "var(--theme-error-500)", marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}
      {justConnected && (
        <p
          style={{ color: "var(--theme-success-500)", marginBottom: "0.75rem" }}
        >
          Connected to {justConnected}.
        </p>
      )}

      {connected && pageName ? (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            ✓ Connected to <strong>{pageName}</strong>
          </p>
          <Button buttonStyle="secondary" onClick={disconnect} disabled={busy}>
            {busy ? "Disconnecting…" : "Disconnect"}
          </Button>
        </>
      ) : (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            Connect a Facebook Page to auto-post and share stories.
          </p>
          <Button
            buttonStyle="primary"
            onClick={() => window.location.assign("/api/facebook/connect")}
          >
            Connect Facebook Page
          </Button>
        </>
      )}
    </div>
  );
}
