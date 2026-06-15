"use client";

import { Button, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

/**
 * Renders on the X Connection global. Reads the connection status from the form
 * state (no extra request) and shows either a "Connect X Account" button (a
 * server-side redirect into X's OAuth dialog) or the connected account with a
 * Disconnect action.
 */
export function XConnectButton() {
  const connected = useFormFields(
    ([fields]) => fields?.connected?.value as boolean | undefined
  );
  const username = useFormFields(
    ([fields]) => fields?.username?.value as string | undefined
  );
  const [busy, setBusy] = useState(false);

  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const error = params?.get("xError");
  const justConnected = params?.get("xConnected");

  async function disconnect() {
    setBusy(true);
    try {
      await fetch("/api/x/disconnect", { method: "POST" });
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
          Connected to @{justConnected}.
        </p>
      )}

      {connected && username ? (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            ✓ Connected to <strong>@{username}</strong>
          </p>
          <Button buttonStyle="secondary" onClick={disconnect} disabled={busy}>
            {busy ? "Disconnecting…" : "Disconnect"}
          </Button>
        </>
      ) : (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            Connect an X account to auto-post and share stories.
          </p>
          <Button
            buttonStyle="primary"
            onClick={() => window.location.assign("/api/x/connect")}
          >
            Connect X Account
          </Button>
        </>
      )}
    </div>
  );
}
