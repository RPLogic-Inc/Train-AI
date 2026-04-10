"use client";

import { useState } from "react";
import { useTraining } from "@/lib/training-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Dumbbell } from "lucide-react";
import type { SuggestedWorkout } from "@/lib/types";

interface AnalysisResult {
  overallAssessment: string;
  currentPhase: string;
  fatigueRisk: "low" | "moderate" | "high";
  weeklyTSSTarget: number;
  recommendations: string[];
  suggestedWorkouts: Array<
    SuggestedWorkout & { sport: string; duration: string; targetTSS: number }
  >;
}

const sportIcons: Record<string, string> = {
  run: "🏃",
  bike: "🚴",
  swim: "🏊",
  strength: "🏋️",
  rest: "😴",
};

const intensityColors: Record<string, string> = {
  recovery: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  easy: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  moderate: "bg-green-500/15 text-green-400 border-green-500/20",
  threshold: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  vo2max: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function PlanPage() {
  const { coachSystemPrompt } = useTraining();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async (request?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: coachSystemPrompt,
          userRequest: request || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch {
      setError("Failed to generate training plan. Make sure your API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training Plan</h1>
        <p className="text-sm text-muted-foreground">
          AI-generated training plan based on your current fitness and goals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Your Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            placeholder="Optional: Describe specific needs (e.g., 'I have a work trip Tuesday-Wednesday and can only train in the morning', 'Focus on building my long run this week', 'I'm feeling fatigued, suggest a recovery week')"
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={() => generatePlan(customRequest)} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Weekly Plan
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Phase</p>
                  <Badge variant="secondary">{analysis.currentPhase}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Fatigue Risk</p>
                  <Badge
                    variant={
                      analysis.fatigueRisk === "high"
                        ? "destructive"
                        : analysis.fatigueRisk === "moderate"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {analysis.fatigueRisk}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Target TSS</p>
                  <span className="text-lg font-bold">{analysis.weeklyTSSTarget}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{analysis.overallAssessment}</p>
              <div className="mt-4 space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary">&#8226;</span>
                    <p className="text-sm text-muted-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Weekly Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.suggestedWorkouts.map((workout, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="text-2xl">
                      {sportIcons[workout.sport] || "🏃"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{workout.day}</span>
                        <Badge
                          variant="outline"
                          className={intensityColors[workout.intensity] || ""}
                        >
                          {workout.intensity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {workout.duration} &middot; ~{workout.targetTSS} TSS
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium">{workout.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {workout.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
