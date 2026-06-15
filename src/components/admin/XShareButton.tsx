"use client";

import { Button, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

/**
 * Sidebar button on the Story edit view. Posts the current story to the
 * connected X account on demand. Disabled until the story is published and
 * hidden once it has already been shared.
 */
export function XShareButton() {
  const { id } = useDocumentInfo();
  const status = useFormFields(
    ([fields]) => fields?._status?.value as string | undefined
  );
  const existingPostId = useFormFields(
    ([fields]) => fields?.xPostId?.value as string | undefined
  );

  const [busy, setBusy] = useState(false);
  const [postId, setPostId] = useState<string | undefined>(existingPostId);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return (
      <p style={{ opacity: 0.7, fontSize: "0.8rem" }}>
        Save the story to enable X sharing.
      </p>
    );
  }

  if (postId) {
    return (
      <div>
        <p style={{ marginBottom: "0.25rem" }}>✓ Shared to X</p>
        <a
          href={`https://twitter.com/i/web/status/${postId}`}
          target="_blank"
          rel="noreferrer"
        >
          View post
        </a>
      </div>
    );
  }

  async function share() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/x/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storyId: id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to share");
        return;
      }
      setPostId(json.postId);
    } catch {
      setError("Failed to share");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || status !== "published";

  return (
    <div>
      <Button buttonStyle="secondary" onClick={share} disabled={disabled}>
        {busy ? "Sharing…" : "Share to X"}
      </Button>
      {status !== "published" && (
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.25rem" }}>
          Publish the story first.
        </p>
      )}
      {error && (
        <p
          style={{
            color: "var(--theme-error-500)",
            fontSize: "0.8rem",
            marginTop: "0.25rem",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
