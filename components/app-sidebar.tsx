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
import type { Icon } from "@tabler/icons-react";

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
import type { User } from "@/db/schema";
import type { PermissionKey } from "@/lib/permissions";

type NavItem = {
  title: string;
  url: string;
  icon: Icon;
  requiredPermission?: PermissionKey;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    requiredPermission: "dashboard:view",
  },
  {
    title: "Live Feeds for Assets",
    url: "/dashboard/live-feeds",
    icon: IconRss,
    requiredPermission: "live-feed:read",
  },
  {
    title: "Decommissioning",
    url: "/dashboard/decommissioning",
    icon: IconArchive,
    requiredPermission: "decommissioning:read",
  },
  {
    title: "Report",
    url: "/dashboard/report",
    icon: IconReport,
    requiredPermission: "reports:read",
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: IconUsers,
    requiredPermission: "users:read",
  },
  {
    title: "Assets",
    url: "/dashboard/assets",
    icon: IconPackage,
    requiredPermission: "assets:read",
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const filteredNav = React.useMemo(() => {
    if (!user) return [];
    const permissions = new Set(user.permissions ?? []);
    const isSuperAdmin = user.role === "superadmin";

    return navItems.filter((item) => {
      if (!item.requiredPermission) return true;
      if (isSuperAdmin) return true;
      return permissions.has(item.requiredPermission);
    });
  }, [user]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5" />
                <span className="text-base font-semibold">RAMS Assets</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
