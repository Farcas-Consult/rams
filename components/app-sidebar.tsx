"use client";

import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconReport,
  IconUsers,
  IconPackage,
  IconRss,
  IconArchive,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { user } from "@src/generated/prisma/client";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Live Feeds for Assets",
      url: "/dashboard/live-feeds",
      icon: IconRss,
    },
    {
      title: "Decommissioning",
      url: "/dashboard/decommissioning",
      icon: IconArchive,
    },
    {
      title: "Report",
      url: "/dashboard/report",
      icon: IconReport,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Assets",
      url: "/dashboard/assets",
      icon: IconPackage,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: user;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // TODO: Re-enable when Better Auth is configured
  // if (!user) {
  //   throw new Error("AppSidebar requires a user but received undefined.");
  // }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
