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

// This is sample data.
// const data = {
//   navMain: [
//     {
//       title: "Pdf 1",
//       url: "#",
//       isActive: true,
//       items: [
//         {
//           title: "History",
//           url: "#",
//         },
//         {
//           title: "Starred",
//           url: "#",
//         },
//         {
//           title: "Settings",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Pdf 2",
//       url: "#",
//       items: [
//         {
//           title: "Genesis",
//           url: "#",
//         },
//         {
//           title: "Explorer",
//           url: "#",
//         },
//         {
//           title: "Quantum",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Pdf 3",
//       url: "#",
//       items: [
//         {
//           title: "Introduction",
//           url: "#",
//         },
//         {
//           title: "Get Started",
//           url: "#",
//         },
//         {
//           title: "Tutorials",
//           url: "#",
//         },
//         {
//           title: "Changelog",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Pdf 4",
//       url: "#",
//       items: [
//         {
//           title: "General",
//           url: "#",
//         },
//         {
//           title: "Team",
//           url: "#",
//         },
//         {
//           title: "Billing",
//           url: "#",
//         },
//         {
//           title: "Limits",
//           url: "#",
//         },
//       ],
//     },
//   ],
// };

type NavItem = {
  title: string;
  url: string;
  items?: NavItem[];
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navMain: NavItem[];
};

export function AppSidebar({ navMain, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="flex gap-2 flex-row py-4">
        <Image src="/logo.png" alt="logo" width={24} height={20} />
        <p>ChatPdf</p>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <UserButton showName={true} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
