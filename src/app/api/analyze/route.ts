import { generateText, Output } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const trainingAnalysisSchema = z.object({
  overallAssessment: z.string().describe("2-3 sentence assessment of current training state"),
  currentPhase: z.string().describe("Current training phase recommendation"),
  fatigueRisk: z.enum(["low", "moderate", "high"]).describe("Risk of overtraining/injury"),
  weeklyTSSTarget: z.number().describe("Recommended TSS target for next week"),
  recommendations: z.array(z.string()).describe("3-5 specific actionable recommendations"),
  suggestedWorkouts: z.array(
    z.object({
      day: z.string(),
      sport: z.enum(["run", "bike", "swim", "strength", "rest"]),
      name: z.string(),
      duration: z.string(),
      description: z.string(),
      targetTSS: z.number(),
      intensity: z.enum(["recovery", "easy", "moderate", "threshold", "vo2max"]),
    })
  ).describe("7-day training plan"),
});

export async function POST(req: Request) {
  const { systemPrompt, userRequest } = await req.json();

  const { output } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    output: Output.object({ schema: trainingAnalysisSchema }),
    system: systemPrompt,
    prompt: userRequest || "Generate an optimized training plan for the coming week based on my current fitness state and goals.",
  });

  return Response.json(output);
}
