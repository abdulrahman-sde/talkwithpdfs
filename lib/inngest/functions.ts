import { db } from "@/db/db";
import { pdfChunks } from "@/db/schema";
import { embedMany } from "ai";
// import { google } from "@ai-sdk/google";
import pdf from "pdf-parse";
import { chunkPdfText } from "@/lib/utils"; // Using the improved chunking
import { inngest } from "./inngest";
import { openai } from "@ai-sdk/openai";

// Helper function to split array into batches
function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

// Helper function to process embeddings in batches
async function generateEmbeddingsInBatches(
  textChunks: string[]
): Promise<number[][]> {
  const BATCH_SIZE = 90; // Using 90 to be safe with Google's 100 limit
  const batches = batchArray(textChunks, BATCH_SIZE);
  const allEmbeddings: number[][] = [];

  console.log(
    `Processing ${textChunks.length} chunks in ${batches.length} batches`
  );

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `Processing batch ${i + 1}/${batches.length} with ${batch.length} chunks`
    );

    try {
      const { embeddings } = await embedMany({
        model: openai.textEmbeddingModel("text-embedding-3-small"),
        maxParallelCalls: 2,
        values: batch,
        providerOptions: {
          openai: {
            dimensions: 1536,
          },
        },
        maxRetries: 2,
      });

      allEmbeddings.push(...embeddings);

      // Small delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error);
      throw new Error(`Failed to process embedding batch ${i + 1}: ${error}`);
    }
  }

  return allEmbeddings;
}

// Helper function to insert embeddings in batches to avoid DB limits
async function insertEmbeddingsInBatches(embeddingsData: any[]): Promise<void> {
  const DB_BATCH_SIZE = 50; // Smaller batches for database insertion
  const batches = batchArray(embeddingsData, DB_BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `Inserting batch ${i + 1}/${batches.length} with ${batch.length} records`
    );

    try {
      await db.insert(pdfChunks).values(batch);
    } catch (error) {
      console.error(`Error inserting batch ${i + 1}:`, error);
      throw new Error(`Failed to insert embedding batch ${i + 1}: ${error}`);
    }
  }
}

export const createEmbeddingsFn = inngest.createFunction(
  { id: "create-pdf-embeddings", retries: 2 },
  { event: "pdf/embeddings.create" },
  async ({ event, step }) => {
    const { pdfId, fileUrl } = event.data;

    // Step 1: Download the PDF content
    const pdfResponseBuffer = await step.run("download-pdf-file", async () => {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }
      return Buffer.from(await response.arrayBuffer());
    });

    // Step 2: Parse the PDF and chunk the text
    const textChunks = await step.run("parse-and-chunk-pdf", async () => {
      const result = await pdf(pdfResponseBuffer);
      const extractedText = result.text;

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No text content found in PDF");
      }

      // Using improved chunking function
      const chunks = chunkPdfText(extractedText);

      console.log(`Created ${chunks.length} text chunks`);

      if (chunks.length === 0) {
        throw new Error("Failed to create text chunks from PDF content");
      }

      return chunks;
    });

    // Step 3: Generate embeddings for each chunk (in batches)
    const embeddings = await step.run("generate-embeddings", async () => {
      return await generateEmbeddingsInBatches(textChunks);
    });

    // Step 4: Prepare embedding data
    const embeddingsData = await step.run(
      "prepare-embeddings-data",
      async () => {
        if (embeddings.length !== textChunks.length) {
          throw new Error(
            `Mismatch: ${embeddings.length} embeddings vs ${textChunks.length} chunks`
          );
        }

        return embeddings.map((embedding, index) => ({
          pdfId,
          embedding,
          chunkIndex: index,
          content: textChunks[index],
        }));
      }
    );

    // Step 5: Insert embeddings into database (in batches)
    await step.run("store-embeddings", async () => {
      await insertEmbeddingsInBatches(embeddingsData);
    });

    console.log(
      `Successfully created ${embeddings.length} embeddings for PDF: ${pdfId}`
    );

    return {
      success: true,
      chunksProcessed: textChunks.length,
      embeddingsCreated: embeddings.length,
    };
  }
);
