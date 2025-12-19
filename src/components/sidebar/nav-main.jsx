import React from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => {
          const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');
          
          if (item.items && item.items.length > 0) {
            return (
              <React.Fragment key={item.title}>
                <Collapsible
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive} className="h-10 text-base">
                        {item.icon && <item.icon className="size-5" />}
                        <span>{item.title}</span>
                        <ChevronRight
                          className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
                {index < items.length - 1 && (
                  <div className="border-t border-border/30 mx-2 my-0" />
                )}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild className="h-10 text-base">
                  <Link to={item.url}>
                    {item.icon && <item.icon className="size-5" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {index < items.length - 1 && (
                <div className="border-t border-border/30 mx-2 my-0" />
              )}
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
