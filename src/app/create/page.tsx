"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateStoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Story submitted!");
    setIsSubmitting(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main className="container max-w-xl mx-auto py-12 px-4 md:px-0">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold font-serif mb-2">Share Your Story</h1>
          <p className="text-muted-foreground">The best time to write is after 2am.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. The clicking sound..." 
              required 
              className="bg-card/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Story</Label>
            <Textarea 
              id="content" 
              placeholder="Tell us what happened..." 
              required 
              className="min-h-[300px] resize-none bg-card/50 font-serif leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author Name</Label>
              <Input 
                id="author" 
                placeholder="Anonymous" 
                className="bg-card/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Topic (Optional)</Label>
              <Input 
                id="tags" 
                placeholder="Horror, Confession..." 
                className="bg-card/50"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-neutral-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Story"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
