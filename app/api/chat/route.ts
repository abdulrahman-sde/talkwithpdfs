import { db } from "@/db/db";
import { messages } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, vectorContext, conversationId } = await req.json();

  // Save user message
  await db.insert(messages).values({
    conversationId,
    sender: "user",
    content: prompt,
  });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `
      You are an assistant that must always answer based on the provided context.
      Context: ${vectorContext}

      - If the context contains information relevant to the user's query, use it directly.
      - If the context does not have the answer, say: 
        "I could not find relevant information in the provided context."
      - Do not hallucinate or invent details outside of the context.
      - Keep responses clear and concise.
    `,
    prompt,
  });

  // Convert the stream to a readable stream for the response
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";

      for await (const chunk of result.textStream) {
        fullText += chunk;
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ chunk, fullText })}\n\n`
          )
        );
      }

      // Save AI response after streaming is complete
      await db.insert(messages).values({
        conversationId,
        sender: "ai",
        content: fullText,
      });

      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ done: true, fullText })}\n\n`
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
