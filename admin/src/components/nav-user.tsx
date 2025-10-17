import { UseAuth } from "@/hooks/auth-context";
import { handleLogout } from "@/hooks/keycloak";
import { IconCreditCard, IconDotsVertical, IconLogout, IconNotification, IconUserCircle } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, UseSidebar } from "./ui/sidebar";

function getInitials(name: string): string {
   if (!name) return "";

   // Pisahkan nama berdasarkan spasi, ambil huruf pertama setiap kata
   const words = name.trim().split(" ");
   const initials = words.map((word) => word.charAt(0).toUpperCase()).join("");

   // Jika nama lebih dari 2 kata, ambil hanya 2 huruf pertama
   return initials.length > 2 ? initials.slice(0, 2) : initials;
}

interface ExtendedKeycloakProfile {
   given_name?: string;
   email?: string;
}

export default function NavUser() {
   const { isMobile } = UseSidebar();
   const { user } = UseAuth();
   const extendedUser = user as ExtendedKeycloakProfile | null;

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                     <Avatar className="h-8 w-8 rounded-lg grayscale">
                        <AvatarImage src="/default-avatar.svg" alt={extendedUser?.given_name} />
                        <AvatarFallback className="rounded-lg">{getInitials(extendedUser?.given_name || "")}</AvatarFallback>
                     </Avatar>
                     <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{extendedUser?.given_name}</span>
                        <span className="text-muted-foreground truncate text-xs">{extendedUser?.email}</span>
                     </div>
                     <IconDotsVertical className="ml-auto size-4" />
                  </SidebarMenuButton>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}>
                  <DropdownMenuLabel className="p-0 font-normal">
                     <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                           <AvatarImage src="/default-avatar.svg" alt={extendedUser?.given_name} />
                           <AvatarFallback className="rounded-lg">{getInitials(extendedUser?.given_name || "")}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                           <span className="truncate font-medium">{extendedUser?.given_name}</span>
                           <span className="text-muted-foreground truncate text-xs">{extendedUser?.email}</span>
                        </div>
                     </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                     <DropdownMenuItem>
                        <IconUserCircle />
                        Account
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <IconCreditCard />
                        Billing
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <IconNotification />
                        Notifications
                     </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleLogout()}>
                     <IconLogout />
                     Log out
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
