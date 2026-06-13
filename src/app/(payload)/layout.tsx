/* THIS FILE WAS GENERATED FOR THE PAYLOAD ROUTE GROUP. */
import type { ServerFunctionClient } from "payload";

import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./admin/importMap.js";
// Payload's admin styling normally loads by compiling @payloadcms/ui SCSS on
// the fly, but Turbopack (Next 16 default) doesn't collect those deep
// node_modules SCSS imports, so the admin renders unstyled. Import Payload's
// complete precompiled admin stylesheet (views + ui + base) instead. Must come
// before custom.scss so local overrides win.
import "@payloadcms/next/css";
import "./custom.scss";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
