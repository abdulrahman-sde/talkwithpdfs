"use server";

import { db } from "@/db/db";
import { conversations, messages, users } from "@/db/schema";
import storePdfToDb from "@/lib/cloudinary/cloudinary";
import { inngest } from "@/lib/inngest/inngest";
import { validatePdf } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export default async function handlePdfEmbeddings(file: File) {
  if (!file) {
    return {
      success: false,
      message: "File Not provided",
    };
  }
  const validation = validatePdf(file);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.error,
    };
  }
  const { userId: clerkId } = await auth();
  console.log("request made");

  if (!clerkId) {
    return Response.json({ error: "User not authenticated" }, { status: 401 });
  }

  const dbUserResult = await db
    .select({ userId: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId));

  if (!dbUserResult.length) {
    return Response.json(
      { error: "User not found in database" },
      { status: 404 }
    );
  }

  const userId = dbUserResult[0].userId;

  try {
    /* 
      -> Save to cloudinary 
      -> Insert Pdf record in DB  
    */
    const { pdfId, title, fileUrl } = await storePdfToDb(file, userId);
    if (!pdfId) {
      return {
        success: false,
        message: "Error saving pdf to Db",
      };
    }

    // Make Conversation record linked to pdf
    const [conversation] = await db
      .insert(conversations)
      .values({
        pdfId,
        userId,
        title: "New Conversation",
      })
      .returning({ id: conversations.id });
    if (!conversation.id) {
      return {
        success: false,
        message: "Failed to create conversation record.",
      };
    }
    console.log("Invoking background job");
    /* 
    ->Fire and forget Inngest background job invocation to
    -> generate embedding and store them to pg vector 
    */
    inngest.send({
      name: "pdf/embeddings.create",
      data: {
        pdfId,
        fileUrl,
      },
    });
    return {
      success: true,
      redirectUrl: `/chat/${conversation.id}`,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
