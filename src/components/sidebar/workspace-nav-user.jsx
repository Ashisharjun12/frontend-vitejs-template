import { LogOut, Sparkles } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function WorkspaceNavUser({
  user
}) {
  const { isMobile } = useSidebar();
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </HoverCardTrigger>
          <HoverCardContent 
            className="w-72 rounded-3xl p-1 shadow-xl border-border/50" 
            align="end" 
            side={isMobile ? "top" : "right"}
            sideOffset={8}
          >
            <div className="flex flex-col py-2">
              <div className="flex flex-col px-4 py-3 mb-1">
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.email}
                </p>
              </div>
              <div className="border-t border-border/50 my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start h-11 rounded-xl text-sm font-normal px-4 hover:bg-accent/50"
              >
                <Sparkles className="mr-3 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </Button>
              <div className="border-t border-border/50 my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start h-11 rounded-xl text-sm font-normal px-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

