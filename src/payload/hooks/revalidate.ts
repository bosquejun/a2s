import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { revalidateTag } from "next/cache";

function revalidateStoryTags(slug?: string, mood?: string) {
  revalidateTag("stories", "max");
  revalidateTag("stories-list", "max");
  if (slug) revalidateTag(`story-${slug}`, "max");
  if (mood) revalidateTag(`stories-mood-${mood}`, "max");
}

export const revalidateStory: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
}) => {
  revalidateStoryTags(doc?.slug, doc?.mood);
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidateTag(`story-${previousDoc.slug}`, "max");
  }
  return doc;
};

export const revalidateStoryDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateStoryTags(doc?.slug, doc?.mood);
  return doc;
};
