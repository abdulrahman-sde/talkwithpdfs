"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  IconEdit,
  IconFileTextFilled,
  IconMessage2Search,
} from "@tabler/icons-react";
import Link from "next/link";
import { ConversationSkeleton } from "../loaders/conversation-skeleton";
import { useState } from "react";
import { NewConversationDialog } from "./new-conversation-dialog";
import { usePathname } from "next/navigation";

export function NavMain({
  items = [],
  isLoading,
}: {
  items: {
    id: string;
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      id: string;
      title: string;
      url: string;
    }[];
  }[];
  isLoading: boolean;
}) {
  // Individual dialog state for each PDF
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  const pathname = usePathname().split("/")[2];
  const handleOpenDialog = (pdfId: string) => {
    console.log("Opening dialog for PDF ID:", pdfId);
    setOpenDialogs((prev) => ({ ...prev, [pdfId]: true }));
  };

  const handleCloseDialog = (pdfId: string) => {
    setOpenDialogs((prev) => ({ ...prev, [pdfId]: false }));
  };
  return (
    <SidebarGroup>
      <Link
        href="/chat"
        className="flex hover:cursor-pointer hover:bg-primary hover:text-white p-1.5 rounded-md items-center text-sm gap-2"
      >
        <IconEdit className="h-4.5 w-4.5" />
        <span>New Chat</span>
      </Link>
      <a className="flex hover:cursor-pointer hover:bg-primary hover:text-white p-1.5 rounded-md items-center text-sm gap-2 mb-4">
        <IconMessage2Search className="h-4.5 w-4.5" />
        <span>Search Chat</span>
      </a>
      <SidebarGroupLabel>Conversations</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading
          ? // Show skeleton loaders when loading
            Array.from({ length: 3 }).map((_, index) => (
              <SidebarMenuItem key={index} className="mt-2">
                <ConversationSkeleton />
              </SidebarMenuItem>
            ))
          : items.map((item) => (
              <Collapsible
                key={item.url}
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <span>
                        <IconFileTextFilled className="size-4" />
                      </span>
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isActive = pathname === subItem.id;
                        return (
                          <SidebarMenuSubItem key={subItem.id}>
                            <SidebarMenuSubButton
                              asChild
                              className={`${
                                isActive &&
                                "border border-s-0 rounded-lg ps-4 bg-neutral-800 hover:bg-neutral-800"
                              }`}
                            >
                              <Link href={subItem.url}>
                                {/* {isActive&&} */}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                    <SidebarMenuSubButton asChild className="ms-2">
                      <button onClick={() => handleOpenDialog(item.id)}>
                        Start New Conversation
                      </button>
                    </SidebarMenuSubButton>
                    {/* dialog */}
                    <NewConversationDialog
                      pdfId={item.id}
                      dialogOpen={openDialogs[item.id] || false}
                      setDialogOpen={(open) =>
                        open
                          ? handleOpenDialog(item.id)
                          : handleCloseDialog(item.id)
                      }
                    />
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
