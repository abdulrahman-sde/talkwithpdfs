"use client";

import * as React from "react";

import { NavMain } from "@/components/dashboard/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { toast } from "sonner";
// import { useConversation } from "@/context/conversationContext";
import { useConversations } from "@/hooks/get-user-conversations";

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { data: conversations, isLoading } = useConversations();
  console.log(conversations);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="flex gap-2 flex-row py-4">
        <Image src="/logo.png" alt="logo" width={24} height={20} />
        <p>ChatPdf</p>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={conversations ?? []} isLoading={isLoading} />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <UserButton showName={true} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
