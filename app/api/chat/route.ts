import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // const { messages }: { messages: UIMessage[] } = await req.json();
  const { prompt, vectorContext } = await req.json();

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `
      You are an assistant that must always answer based on the provided context.
      Context: ${vectorContext}

      - If the context contains information relevant to the user’s query, use it directly.
      - If the context does not have the answer, say: 
        "I could not find relevant information in the provided context."
      - Do not hallucinate or invent details outside of the context.
      - Keep responses clear and concise.
    `,
    prompt,
  });

  return NextResponse.json({
    text,
    success: true,
  });
}
