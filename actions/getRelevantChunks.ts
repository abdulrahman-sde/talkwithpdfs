"use server";
import { sql } from "drizzle-orm";
import { db } from "@/db/db";
import { pdfChunks, conversations, messages } from "@/db/schema";
import { embed, generateText } from "ai";
// import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

type Message = {
  id: string;
  conversationId: string;
  sender: "user" | "ai";
  content: string;
  createdAt: Date;
};

// Generate optimized query using conversation context
export async function generateOptimizedQuery(
  conversationId: string,
  latestMessage: string
): Promise<string> {
  try {
    // Get conversation history (last 10 messages for context)
    const conversationHistory = await db
      .select({
        sender: messages.sender,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(sql`${messages.conversationId} = ${conversationId}`)
      .orderBy(sql`${messages.createdAt} DESC`)
      .limit(10);

    // Reverse to get chronological order
    const historyContext = conversationHistory
      .reverse()
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join("\n");

    const { text: optimizedQuery } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are an expert at analyzing conversations and generating precise search queries.
      
Your task is to analyze the conversation history and the user's latest message to generate the most relevant and specific search query that will help find the most pertinent information from a PDF document.
      
Guidelines:
      - Consider the full conversation context and flow
      - Identify key topics, entities, and concepts mentioned
      - Focus on the user's current information need
      - Generate a concise but comprehensive query (2-4 key phrases)
      - Include synonyms or related terms when relevant
      - Prioritize recent context but consider the overall conversation theme
      
Return ONLY the optimized search query, nothing else.`,
      prompt: `Conversation History:
${historyContext}

User's Latest Message: ${latestMessage}

Generate an optimized search query to find the most relevant information from the PDF:`,
    });

    console.log(`Original query: "${latestMessage}"`);
    console.log(`Optimized query: "${optimizedQuery}"`);

    return optimizedQuery.trim();
  } catch (error) {
    console.error("Error generating optimized query:", error);
    // Fallback to original message if optimization fails
    return latestMessage;
  }
}

export async function getRelevantChunks(conversationId: string, query: string) {
  try {
    // 1. Generate optimized query using conversation context
    const optimizedQuery = await generateOptimizedQuery(conversationId, query);

    // 2. Embed the optimized query
    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: optimizedQuery,
      providerOptions: {
        openai: {
          dimensions: 1536,
        },
      },
    });

    // 3. Get pdfId for the conversation
    const [conv] = await db
      .select({ pdfId: conversations.pdfId })
      .from(conversations)
      .where(sql`${conversations.id} = ${conversationId}`);

    if (!conv) throw new Error("Conversation not found");

    // 4. Vector similarity search using Drizzle's query builder with optimized query
    const chunks = await db
      .select({
        content: pdfChunks.content,
        chunkIndex: pdfChunks.chunkIndex,
        similarity: sql<number>`1 - (${
          pdfChunks.embedding
        } <=> ${JSON.stringify(embedding)}::vector)`,
      })
      .from(pdfChunks)
      .where(sql`${pdfChunks.pdfId} = ${conv.pdfId}`)
      .orderBy(
        sql`${pdfChunks.embedding} <=> ${JSON.stringify(embedding)}::vector`
      )
      .limit(5);

    return chunks;
  } catch (error) {
    console.error("Error in getRelevantChunksWithDrizzle:", error);
    throw error;
  }
}
