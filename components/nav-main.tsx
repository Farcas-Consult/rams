"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Link href="/dashboard/assets/new" className="w-full">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-green-500 text-white transition-colors duration-200 hover:bg-green-600 focus-visible:ring-offset-0"
            >
                <IconCirclePlusFilled />
                <span>Quick Create Asset</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "justify-start transition-colors duration-200",
                    pathname?.startsWith(item.url)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
