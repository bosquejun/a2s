"use client";

import { useSyncExternalStore } from "react";

/**
 * Versioned key for the reader's "already read" memory. Bump the suffix if the
 * stored shape ever changes so stale entries are ignored rather than misread.
 */
const STORAGE_KEY = "after2am_read_history_v1";

/**
 * Cap on remembered slugs. Old entries fall off the front (FIFO) so a heavy
 * binge can never grow the payload unbounded. 200 is plenty to keep a night's
 * worth of reading out of the continuation rotation.
 */
const MAX_ENTRIES = 200;

/**
 * Append `slug` as the most-recently-read entry: de-duplicates (re-reading
 * refreshes recency instead of growing the list) and caps the total, dropping
 * the oldest. Pure so it can be unit-tested without a DOM.
 */
export function appendRead(
  history: string[],
  slug: string,
  max = MAX_ENTRIES
): string[] {
  if (!slug) return history;
  const withoutSlug = history.filter((s) => s !== slug);
  return [...withoutSlug, slug].slice(-max);
}

function readStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only strings; tolerate a corrupted/foreign value gracefully.
    return parsed.filter((slug): slug is string => typeof slug === "string");
  } catch {
    return [];
  }
}

function writeStored(slugs: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Throws in private mode / quota exceeded / disabled — read history is a
    // best-effort enhancement, so silently degrade to a stateless loop.
  }
}

interface Snapshot {
  /** Slugs the reader has already opened, oldest first. */
  history: string[];
  /** False during SSR + the first (hydration) render; true once client-loaded. */
  hydrated: boolean;
}

/**
 * Stable empty snapshot used for SSR and the hydration render so server and
 * client markup match. The real history is only read afterwards.
 */
const SERVER_SNAPSHOT: Snapshot = { history: [], hydrated: false };

// A single module-level store shared by every consumer in the tab, so the read
// history stays in sync across components and survives client-side navigation.
let snapshot: Snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (snapshot.hydrated) return;
  snapshot = { history: readStored(), hydrated: true };
}

function getClientSnapshot(): Snapshot {
  // Lazily hydrate from storage the first time a client render reads the store.
  ensureLoaded();
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Record a slug as read, updating the store and notifying subscribers. */
function markReadInStore(slug: string) {
  ensureLoaded();
  // Skip the no-op case (already the most-recent) to avoid a needless render.
  const { history } = snapshot;
  if (!slug || history[history.length - 1] === slug) return;

  const next = appendRead(history, slug);
  snapshot = { history: next, hydrated: true };
  writeStored(next);
  for (const listener of listeners) listener();
}

export interface ReadHistory {
  /** Slugs the reader has already opened, oldest first. */
  history: string[];
  /** Record a slug as read (idempotent; moves it to most-recent). */
  markRead: (slug: string) => void;
  /**
   * False until the client has read localStorage. Lets callers avoid acting on
   * an empty list during SSR/first paint, preventing hydration flicker.
   */
  hydrated: boolean;
}

/**
 * Lightweight, client-only memory of which stories the reader has seen. Backed
 * by localStorage so the continuation loop ("Next story", "Surprise me", "More
 * like this") can keep serving fresh stories across hops and return visits
 * instead of looping back into ones already read.
 */
export function useReadHistory(): ReadHistory {
  const { history, hydrated } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  return { history, markRead: markReadInStore, hydrated };
}
