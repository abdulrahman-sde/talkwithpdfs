import { NextResponse } from "next/server";
import { db } from "@/db/db"; // your db instance
import { conversations, pdfs } from "@/db/schema"; // your table/schema
import { eq } from "drizzle-orm"; // adjust if using drizzle or prisma
import { auth } from "@clerk/nextjs/server";

// GET /api/conversations/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Remove the await - params is already resolved
    const { id } = await params;

    const { sessionClaims } = await auth();
    if (!sessionClaims || !sessionClaims.dbUserId) {
      throw new Error("User not authenticated");
    }

    console.log("123456");

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
