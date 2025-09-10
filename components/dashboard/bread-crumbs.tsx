"use client";
import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export default function BreadCrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const convoId = parts[2]; // assuming /chat/[id]
  const [conversationName, setConversationName] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/chat/") && convoId) {
      console.log(convoId);
      setLoading(true);
      fetch(`/api/conversations/${convoId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
          setConversationName(data.conversationName || "Untitled Conversation");
          setPdfName(data.pdfName || "");
        })
        .catch((err) => {
          console.error("Failed to fetch conversation:", err);
          setConversationName("Error loading conversation");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Clear state when not on a conversation page
      setConversationName("");
      setPdfName("");
    }
  }, [pathname]);

  const isConversationPage =
    pathname.startsWith("/chat/") && pathname !== "/chat";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/chat">
            {isConversationPage ? "Chat" : "Home"}
          </BreadcrumbLink>
        </BreadcrumbItem> */}
        {isConversationPage && (
          <>
            {/* <BreadcrumbSeparator className="hidden md:block" /> */}
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">{pdfName || "PDF"}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {isConversationPage
              ? loading
                ? "Loading..."
                : conversationName || "Conversation"
              : pathname === "/chat"
              ? "Chat"
              : "Current Page"}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
