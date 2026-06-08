import "server-only";

import configPromise from "@payload-config";
import {
  convertHTMLToLexical,
  editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { JSDOM } from "jsdom";

/**
 * Convert the simple HTML our AI agents emit (<p>, <br />, <strong>, <em>)
 * into a Lexical editor state so it can be stored in the `content` rich-text
 * field and edited in the Payload admin.
 *
 * Kept separate from the pure Lexical helpers because it depends on the
 * Payload config, which must not be imported from collection hooks.
 */
export async function htmlToLexical(
  html: string
): Promise<SerializedEditorState> {
  const config = await configPromise;
  const editorConfig = await editorConfigFactory.default({ config });

  return convertHTMLToLexical({
    editorConfig,
    html,
    JSDOM,
  }) as SerializedEditorState;
}
