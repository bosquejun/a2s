import type { GlobalConfig } from "payload";

/**
 * Stores the Threads account connection established through the browser OAuth
 * flow (the "Connect Threads Account" button in the admin). The long-lived
 * access token is encrypted at rest, hidden from the admin UI, and never
 * exposed via the API — only server-side helpers in `lib/services/threads`
 * read it.
 */
export const ThreadsConnection: GlobalConfig = {
  slug: "threads-connection",
  label: "Threads Connection",
  admin: { group: "Settings" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "connect",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/ThreadsConnectButton#ThreadsConnectButton",
        },
      },
    },
    {
      name: "connected",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
        description: "Whether a Threads account is currently linked.",
      },
    },
    {
      name: "username",
      type: "text",
      admin: {
        readOnly: true,
        description: "The connected Threads (@handle) account.",
      },
    },
    {
      name: "threadsUserId",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "connectedAt",
      type: "date",
      admin: {
        readOnly: true,
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    // Encrypted secrets — never returned by the API, never shown in the admin.
    {
      name: "accessToken",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
    {
      name: "tokenExpiresAt",
      type: "date",
      admin: { hidden: true },
    },
  ],
};
