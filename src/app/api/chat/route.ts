import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, systemPrompt }: { messages: UIMessage[]; systemPrompt: string } =
    await req.json();

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
