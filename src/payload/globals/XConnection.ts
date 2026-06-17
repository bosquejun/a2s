import type { GlobalConfig } from "payload";

/**
 * Stores the X (Twitter) account connection established through the browser
 * OAuth 2.0 (PKCE) flow (the "Connect X Account" button in the admin). The
 * access/refresh tokens are encrypted at rest, hidden from the admin UI, and
 * never exposed via the API — only server-side helpers in `lib/services/x`
 * read them.
 */
export const XConnection: GlobalConfig = {
  slug: "x-connection",
  label: "X Connection",
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
          Field: "/components/admin/XConnectButton#XConnectButton",
        },
      },
    },
    {
      name: "connected",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
        description: "Whether an X account is currently linked.",
      },
    },
    {
      name: "username",
      type: "text",
      admin: {
        readOnly: true,
        description: "The connected X (@handle) account.",
      },
    },
    {
      name: "xUserId",
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
    // Which auth method backs the connection: the browser OAuth 2.0 flow
    // ("oauth2") or manually pasted OAuth 1.0a keys ("oauth1").
    {
      name: "authMethod",
      type: "text",
      defaultValue: "oauth2",
      admin: { hidden: true },
    },
    // Encrypted secrets — never returned by the API, never shown in the admin.
    {
      name: "accessToken",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
    {
      name: "refreshToken",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
    {
      name: "tokenExpiresAt",
      type: "date",
      admin: { hidden: true },
    },
    {
      name: "codeVerifier",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
    // OAuth 1.0a credentials (manual connection path), encrypted at rest.
    {
      name: "consumerKey",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
    {
      name: "consumerSecret",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
    {
      name: "accessTokenSecret",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
  ],
};
