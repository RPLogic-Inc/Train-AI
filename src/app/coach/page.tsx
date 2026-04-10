"use client";

import { useTraining } from "@/lib/training-context";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function CoachPage() {
  const { coachSystemPrompt } = useTraining();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold">AI Training Coach</h1>
        <p className="text-sm text-muted-foreground">
          Powered by Claude &mdash; ask about your training, get personalized
          workout recommendations, and plan your race strategy.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface systemPrompt={coachSystemPrompt} />
      </div>
    </div>
  );
}
