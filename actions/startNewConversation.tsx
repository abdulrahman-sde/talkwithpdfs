"use server";
import { db } from "@/db/db";
import { conversations, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function startNewConversation({
  pdfId,
  title,
}: {
  pdfId: string;
  title: string;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("User Not authenticated");
  }

  console.log("Creating conversation with:", { pdfId, title, clerkId });

  try {
    // Get the database user ID
    const userResult = await db
      .select({
        userId: users.id,
      })
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!userResult.length) {
      throw new Error("User not found in database");
    }

    const dbUserId = userResult[0].userId;
    console.log("Found database user ID:", dbUserId);

    // Insert the conversation
    const [conversation] = await db
      .insert(conversations)
      .values({
        pdfId,
        title,
        userId: dbUserId,
      })
      .returning();

    console.log("Created conversation:", conversation);
    return { success: true, conversationId: conversation.id };
  } catch (error) {
    console.error("Failed to create conversation:", error);
    throw new Error("Failed to start new conversation");
  }
}
