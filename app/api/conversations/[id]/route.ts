import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/db";
import { conversations, messages, pdfs, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// Ensure Node.js runtime for better compatibility
export const runtime = "nodejs";

// GET /api/conversations/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("fetching covo");
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const userResult = await db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!userResult.length) {
      return Response.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const userId = userResult[0].userId;
    const [convo, convoMessages] = await Promise.all([
      db
        .select({
          conversationName: conversations.title,
          pdfName: pdfs.title,
        })
        .from(conversations)
        .leftJoin(pdfs, eq(conversations.pdfId, pdfs.id))
        .where(and(eq(conversations.id, id), eq(conversations.userId, userId))),

      db.select().from(messages).where(eq(messages.conversationId, id)),
    ]);

    if (!convo.length) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...convo[0],
      messages: convoMessages,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
