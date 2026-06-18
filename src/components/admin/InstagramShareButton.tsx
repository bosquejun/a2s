"use client";

import { Button, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

type InstagramPostFormat = "image" | "carousel";

/**
 * Sidebar button on the Story edit view. Posts the current story to the
 * connected Instagram account on demand, as either a single OG card or a
 * multi-slide carousel. Disabled until the story is published and replaced with
 * a confirmation once it has already been shared.
 */
export function InstagramShareButton() {
  const { id } = useDocumentInfo();
  const status = useFormFields(
    ([fields]) => fields?._status?.value as string | undefined
  );
  const existingPostId = useFormFields(
    ([fields]) => fields?.instagramPostId?.value as string | undefined
  );

  const [busy, setBusy] = useState(false);
  const [postId, setPostId] = useState<string | undefined>(existingPostId);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return (
      <p style={{ opacity: 0.7, fontSize: "0.8rem" }}>
        Save the story to enable Instagram sharing.
      </p>
    );
  }

  if (postId) {
    // The publish call returns an Instagram media id, not the URL shortcode, so
    // there is no reliable public permalink to build from it here. Show the
    // confirmation only rather than a link that would 404.
    return <p>✓ Shared to Instagram</p>;
  }

  async function share(format: InstagramPostFormat) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/instagram/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storyId: id, format }),
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
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Button
        buttonStyle="secondary"
        onClick={() => share("image")}
        disabled={disabled}
      >
        {busy ? "Sharing…" : "Share to Instagram"}
      </Button>
      <Button
        buttonStyle="secondary"
        onClick={() => share("carousel")}
        disabled={disabled}
      >
        {busy ? "Sharing…" : "Share as carousel"}
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
