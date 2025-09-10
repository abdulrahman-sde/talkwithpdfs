import React from "react";
import { AppSidebar } from "./app-sidebar";
import { db } from "@/db/db";
import { conversations, pdfs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
export default async function AppSideBarProvider({}) {
  const { sessionClaims } = await auth();
  if (!sessionClaims || !sessionClaims.dbUserId) {
    throw new Error("User not authenticated");
  }

  const userId = String(sessionClaims.dbUserId);

  const rows = await db
    .select({
      conversationId: conversations.id,
      conversationTitle: conversations.title,
      pdfId: pdfs.id,
      pdfTitle: pdfs.title,
    })
    .from(conversations)
    .leftJoin(pdfs, eq(conversations.pdfId, pdfs.id))
    .where(eq(conversations.userId, userId));

  // group by pdfId
  const grouped = rows.reduce((acc, row) => {
    if (!row.pdfId) return acc;

    if (!acc[row.pdfId]) {
      acc[row.pdfId] = {
        title: row.pdfTitle ?? "Untitled PDF",
        url: `/pdf/${row.pdfId}`,
        items: [],
      };
    }

    acc[row.pdfId].items.push({
      title: row.conversationTitle ?? "Untitled Conversation",
      url: `/chat/${row.conversationId}`,
    });

    return acc;
  }, {} as Record<string, { title: string; url: string; items: { title: string; url: string }[] }>);

  const navMain = Object.values(grouped);

  return (
    <>
      <AppSidebar navMain={navMain} />
    </>
  );
}
