"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useConversation } from "@/hooks/get-single-conversation";
import { useParams } from "next/navigation";

export default function BreadCrumbs() {
  const params = useParams();
  const convoId = params.id as string | undefined;
  const { conversationName, pdfName, isLoading, isError } =
    useConversation(convoId);

  const isConversationPage = Boolean(convoId);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {isConversationPage && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">{pdfName || "PDF"}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>
            {isConversationPage
              ? isLoading
                ? "Loading..."
                : isError
                ? "Error loading conversation"
                : conversationName
              : "Chat"}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
