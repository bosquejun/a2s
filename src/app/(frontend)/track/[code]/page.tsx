"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type StoryRequestStatus = "PENDING" | "REJECTED" | "APPROVED" | "FAILED";

interface StoryRequest {
  id: string;
  content: string;
  status: StoryRequestStatus;
  notes: string | null;
  trackCode: string;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  story: {
    id: string;
    slug: string;
    title: string;
    publishedAt: string | null;
  } | null;
}

const statusConfig: Record<
  StoryRequestStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    description: string;
  }
> = {
  PENDING: {
    label: "Processing",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/40",
    textColor: "text-amber-400",
    description: "Your whisper is being reviewed and processed.",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
    description: "Your whisper has been approved and published.",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/40",
    textColor: "text-rose-400",
    description: "Your whisper was not approved for publication.",
  },
  FAILED: {
    label: "Failed",
    icon: AlertCircle,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/40",
    textColor: "text-slate-400",
    description: "An error occurred while processing your whisper.",
  },
};

function TrackPageContent() {
  const params = useParams();
  const code = params.code as string;
  const [storyRequest, setStoryRequest] = useState<StoryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchStoryRequest() {
      try {
        const response = await fetch(`/api/track/${code}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Story request not found");
          } else {
            setError("Failed to load story request");
          }
          setLoading(false);
          return;
        }
        const data = await response.json();
        setStoryRequest(data);

        // Stop polling if status is final (not PENDING)
        if (data.status !== "PENDING" && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      fetchStoryRequest();

      // Auto-refresh every 5 seconds if status is PENDING
      intervalId = setInterval(() => {
        fetchStoryRequest();
      }, 5000);

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [code]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-6 sm:pt-8 pb-24 sm:pb-32 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-slate-500 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !storyRequest) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-6 sm:pt-8 pb-24 sm:pb-32 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-12">
          <Alert variant="destructive">
            <XCircle className="size-3.5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Story request not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const config = statusConfig[storyRequest.status];
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-6 sm:pt-8 pb-24 sm:pb-32 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
        <header className="flex items-center justify-between py-3 sm:py-4 border-b border-slate-900">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors flex items-center space-x-2 text-[10px] sm:text-xs uppercase tracking-widest touch-manipulation"
          >
            <span>← Back</span>
          </Link>
        </header>

        <div className="space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif text-slate-300 mb-2">
              Whisper Status
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[10px] sm:text-xs text-slate-600 font-mono">
              <span>Track Code:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
                <code className="text-slate-400 tracking-wider break-all">
                  {storyRequest.trackCode}
                </code>
              </div>
            </div>
          </div>

          <Alert
            className={`${config.bgColor} ${config.borderColor} ${config.textColor} [&_svg]:${config.color}`}
          >
            <StatusIcon className={`size-4 ${config.color}`} />
            <AlertTitle className={config.textColor}>{config.label}</AlertTitle>
            <AlertDescription className={`${config.textColor}/90`}>
              {config.description}
              {storyRequest.notes && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-xs font-medium mb-1">Notes:</p>
                  <p className="text-xs/relaxed opacity-90">
                    {storyRequest.notes}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {storyRequest.status === "APPROVED" && storyRequest.story && (
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-serif text-slate-300">
                Your whisper is live
              </h2>
              <Link
                href={`/story/${storyRequest.story.slug}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium touch-manipulation w-full sm:w-auto"
              >
                <span>Read your story</span>
                <ExternalLink className="size-3.5 sm:size-4" />
              </Link>
            </div>
          )}

          <div className="pt-5 sm:pt-6 border-t border-slate-900 space-y-2 text-[10px] sm:text-xs text-slate-600">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span>Submitted:</span>
              <span className="font-mono break-all sm:break-normal">
                {new Date(storyRequest.createdAt).toLocaleString()}
              </span>
            </div>
            {storyRequest.approvedAt && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span>Approved:</span>
                <span className="font-mono break-all sm:break-normal">
                  {new Date(storyRequest.approvedAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span>Last updated:</span>
              <span className="font-mono break-all sm:break-normal">
                {new Date(storyRequest.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-8 pb-32 px-6 animate-fade-in">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-slate-500 text-center">Loading...</div>
          </div>
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
