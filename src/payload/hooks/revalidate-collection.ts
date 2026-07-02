import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { revalidateTag } from "next/cache";

function revalidateCollectionTags(slug?: string) {
  revalidateTag("collections", "max");
  if (slug) revalidateTag(`collection-${slug}`, "max");
}

export const revalidateCollection: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
}) => {
  revalidateCollectionTags(doc?.slug);
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidateTag(`collection-${previousDoc.slug}`, "max");
  }
  return doc;
};

export const revalidateCollectionDelete: CollectionAfterDeleteHook = ({
  doc,
}) => {
  revalidateCollectionTags(doc?.slug);
  return doc;
};
