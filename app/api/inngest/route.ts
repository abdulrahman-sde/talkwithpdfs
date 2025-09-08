import { createEmbeddingsFn } from "@/lib/inngest/functions";
import { inngest } from "@/lib/inngest/inngest";
import { serve } from "inngest/next"; // or your preferred framework

// Register all Inngest functions here
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createEmbeddingsFn],
});
