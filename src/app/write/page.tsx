import type { Metadata } from "next";
import { WritePage } from "@/components/write-page";

export const metadata: Metadata = {
  title: "Whisper a Story | After 2AM Stories",
  description:
    "Share your late-night thoughts, confessions, and haunting narratives. Write your story after 2AM.",
  robots: {
    index: false, // Writing page doesn't need to be indexed
    follow: true,
  },
};

export default function WriteRoute() {
  return <WritePage />;
}


