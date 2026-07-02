"use client";

import { Button, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

/**
 * Renders on the X Connection global. Reads the connection status from the form
 * state (no extra request) and shows either the connect options (the OAuth 2.0
 * redirect button plus a manual OAuth 1.0a key form) or the connected account
 * with a Disconnect action.
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
          <ManualConnect />
        </>
      )}
    </div>
  );
}

/**
 * Fallback for when the browser OAuth flow can't be used: paste the four
 * long-lived OAuth 1.0a credentials from the X developer portal. Posts to
 * `/api/x/manual`, which verifies them against X before storing.
 */
function ManualConnect() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fields, setFields] = useState({
    consumerKey: "",
    consumerSecret: "",
    accessToken: "",
    accessTokenSecret: "",
  });

  function update(name: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/x/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error ?? "Failed to connect.");
        setBusy(false);
        return;
      }
      window.location.assign(
        `${window.location.pathname}?xConnected=${encodeURIComponent(data.username)}`
      );
    } catch {
      setErr("Network error. Please try again.");
      setBusy(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "32rem",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "4px",
    background: "var(--theme-input-bg)",
    color: "var(--theme-text)",
    fontFamily: "monospace",
    fontSize: "0.85rem",
  };

  const inputs: { name: keyof typeof fields; label: string }[] = [
    { name: "consumerKey", label: "API Key (Consumer Key)" },
    { name: "consumerSecret", label: "API Secret (Consumer Secret)" },
    { name: "accessToken", label: "Access Token" },
    { name: "accessTokenSecret", label: "Access Token Secret" },
  ];

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "var(--theme-text-dim, var(--theme-text))",
          textDecoration: "underline",
          fontSize: "0.85rem",
        }}
      >
        {open ? "Hide manual connection" : "Connect manually with API keys"}
      </button>

      {open && (
        <div style={{ marginTop: "0.75rem" }}>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--theme-text-dim, var(--theme-text))",
              marginBottom: "0.75rem",
              maxWidth: "32rem",
            }}
          >
            Paste the four OAuth 1.0a credentials from your X app
            (developer.x.com → Keys and tokens). The app must have Read and
            Write permissions. Stored encrypted.
          </p>
          {err && (
            <p
              style={{
                color: "var(--theme-error-500)",
                marginBottom: "0.5rem",
              }}
            >
              {err}
            </p>
          )}
          {inputs.map(({ name, label }) => (
            <div key={name}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  marginBottom: "0.15rem",
                }}
              >
                {label}
              </label>
              <input
                type="password"
                autoComplete="off"
                value={fields[name]}
                onChange={(e) => update(name, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
          <Button buttonStyle="primary" onClick={submit} disabled={busy}>
            {busy ? "Verifying…" : "Save & Verify"}
          </Button>
        </div>
      )}
    </div>
  );
}
