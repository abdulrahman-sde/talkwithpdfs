import { db } from "@/db/db";
import { messages } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

// Ensure Node.js runtime for better compatibility
export const runtime = "nodejs";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log("Chat API called");

  try {
    const body = await req.json();
    console.log("Request body parsed:", {
      hasPrompt: !!body.prompt,
      hasConversationId: !!body.conversationId,
    });

    const { prompt, vectorContext, conversationId } = body;

    if (!prompt || !conversationId) {
      console.error("Missing required fields:", {
        prompt: !!prompt,
        conversationId: !!conversationId,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Saving user message to database");
    // Save user message
    await db.insert(messages).values({
      conversationId,
      sender: "user",
      content: prompt,
    });
    console.log("User message saved successfully");

    console.log("Generating AI response");
    const { text } = await generateText({
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
    console.log("AI response generated successfully");

    console.log("Saving AI message to database");
    // Save AI response
    await db.insert(messages).values({
      conversationId,
      sender: "ai",
      content: text,
    });
    console.log("AI message saved successfully");

    return NextResponse.json({
      text,
      success: true,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
