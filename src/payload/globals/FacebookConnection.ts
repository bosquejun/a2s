import type { GlobalConfig } from "payload";

/**
 * Stores the Facebook Page connection established through the browser OAuth flow
 * (the "Connect Facebook Page" button in the admin). The access tokens are
 * encrypted at rest, hidden from the admin UI, and never exposed via the API —
 * only server-side helpers in `lib/services/facebook` read them.
 */
export const FacebookConnection: GlobalConfig = {
  slug: "facebook-connection",
  label: "Facebook Connection",
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
          Field: "/components/admin/FacebookConnectButton#FacebookConnectButton",
        },
      },
    },
    {
      name: "connected",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
        description: "Whether a Facebook Page is currently linked.",
      },
    },
    {
      name: "pageName",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "pageId",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "userName",
      type: "text",
      admin: {
        readOnly: true,
        description: "The Facebook account that authorized the connection.",
      },
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
      name: "pageAccessToken",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
    {
      name: "userAccessToken",
      type: "text",
      access: { read: () => false },
      admin: { hidden: true },
    },
  ],
};
