"use server";

import { db } from "@/db/db";
import { conversations } from "@/db/schema";
import storePdfToDb from "@/lib/cloudinary/cloudinary";
import { inngest } from "@/lib/inngest/inngest";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function handlePdfEmbeddings(file: File) {
  if (!file) {
    console.log("File not provided");
  }
  const { sessionClaims } = await auth();
  if (!sessionClaims || !sessionClaims.dbUserId) {
    throw new Error("User not authenticated");
  }

  const userId = String(sessionClaims.dbUserId);
  /* 
  -> Save to cloudinary 
  -> Insert Pdf record in DB  
  */
  const { pdfId, title, fileUrl } = await storePdfToDb(file, userId);
  if (!pdfId) {
    return "error saving pdf";
  }
  // Make Conversation record linked to pdf
  const [conversation] = await db
    .insert(conversations)
    .values({
      pdfId,
      userId,
      title,
    })
    .returning({ id: conversations.id });

  /* 
  -> Inngest background job invocation to
  -> generate embedding and store them to pg vector 
  ->>Fire and forget
   */
  await inngest.send({
    name: "pdf/embeddings.create",
    data: {
      pdfId,
      fileUrl,
    },
  });

  redirect(`/chat/${conversation.id}`);
}
