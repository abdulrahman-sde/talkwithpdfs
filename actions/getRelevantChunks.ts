"use server";
import { sql } from "drizzle-orm";
import { db } from "@/db/db";
import { pdfChunks, conversations } from "@/db/schema";
import { embed } from "ai";
// import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export async function getRelevantChunks(conversationId: string, query: string) {
  try {
    // 1. Embed the query
    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: query,
      providerOptions: {
        openai: {
          dimensions: 1536,
        },
      },
    });

    // 2. Get pdfId for the conversation
    const [conv] = await db
      .select({ pdfId: conversations.pdfId })
      .from(conversations)
      .where(sql`${conversations.id} = ${conversationId}`);

    if (!conv) throw new Error("Conversation not found");

    // 3. Vector similarity search using Drizzle's query builder
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
