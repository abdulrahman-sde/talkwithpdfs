import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/db";
import { conversations, pdfs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// GET /api/conversations/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ now correct

    const { sessionClaims } = await auth();
    if (!sessionClaims || !sessionClaims.dbUserId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const convo = await db
      .select({ conversationName: conversations.title, pdfName: pdfs.title })
      .from(conversations)
      .leftJoin(pdfs, eq(conversations.pdfId, pdfs.id))
      .where(eq(conversations.id, id))
      .limit(1);

    if (!convo.length) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(convo[0]);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
