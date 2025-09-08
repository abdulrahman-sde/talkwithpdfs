// src/lib/inngest/functions/pdf.ts
import { db } from "@/db/db";
import { pdfChunks } from "@/db/schema";
import { embedMany } from "ai";
import { google } from "@ai-sdk/google";
import pdf from "pdf-parse";
import { chunkText } from "@/lib/utils";
import { inngest } from "./inngest";

export const createEmbeddingsFn = inngest.createFunction(
  { id: "create-pdf-embeddings", retries: 2 },
  { event: "pdf/embeddings.create" },
  async ({ event, step }) => {
    const { pdfId, fileUrl } = event.data;

    // 1. Download the PDF content
    const pdfResponseBuffer = await step.run("download-pdf-file", async () => {
      const response = await fetch(fileUrl);
      return Buffer.from(await response.arrayBuffer());
    });

    // 2. Parse the PDF and chunk the text
    const textChunks = await step.run("parse-and-chunk-pdf", async () => {
      // const pdfBuffer = Buffer.from(await resp.arrayBuffer());
      const result = await pdf(pdfResponseBuffer);
      const extractedText = result.text;
      return chunkText(extractedText, 500, 50);
    });

    if (!textChunks || textChunks.length === 0) {
      throw new Error("Failed to create text chunks from PDF content");
    }

    // 3. Generate embeddings for each chunk
    const { embeddings } = await step.run("generate-embeddings", async () => {
      // 'embeddings' is an array of embedding objects (number[][]).
      // It is sorted in the same order as the input values.
      return await embedMany({
        model: google.textEmbedding("text-embedding-004"),
        maxParallelCalls: 2,
        values: textChunks,
        providerOptions: {
          google: {
            dimensions: 768,
          },
        },
        maxRetries: 0,
      });
    });

    // 4. Prepare and insert embeddings into the database
    const embeddingsData = embeddings.map((embedding, index) => ({
      pdfId,
      embedding,
      chunkIndex: index,
      content: textChunks[index],
    }));

    await step.run("store-embeddings", async () => {
      await db.insert(pdfChunks).values(embeddingsData);
    });

    console.log(`Successfully created embeddings for PDF: ${pdfId}`);

    return { success: true };
  }
);
