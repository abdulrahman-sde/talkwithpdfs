import { db } from "@/db/db";
import { conversations, pdfs, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("request made");

    if (!userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const dbUserResult = await db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!dbUserResult.length) {
      return Response.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const dbUserId = dbUserResult[0].userId;

    const rows = await db
      .select({
        conversationId: conversations.id,
        conversationTitle: conversations.title,
        pdfId: pdfs.id,
        pdfTitle: pdfs.title,
      })
      .from(conversations)
      .leftJoin(pdfs, eq(conversations.pdfId, pdfs.id))
      .where(eq(conversations.userId, dbUserId))
      .orderBy(desc(conversations.createdAt));
    // group by pdfId
    const grouped = rows.reduce((acc, row) => {
      if (!row.pdfId) return acc;

      if (!acc[row.pdfId]) {
        acc[row.pdfId] = {
          id: row.pdfId, // Add the PDF ID
          title: row.pdfTitle ?? "Untitled PDF",
          url: `/pdf/${row.pdfId}`,
          items: [],
        };
      }

      acc[row.pdfId].items.push({
        id: row.conversationId, // Add conversation ID
        title: row.conversationTitle ?? "Untitled Conversation",
        url: `/chat/${row.conversationId}`,
      });

      return acc;
    }, {} as Record<string, { id: string; title: string; url: string; items: { id: string; title: string; url: string }[] }>);

    return Response.json(Object.values(grouped));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
