import { TicketsPlane } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export default function AppLogo() {
   const [isHover, setIsHover] = useState(false);

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
               <Link
                  to="/"
                  onMouseEnter={() => setIsHover(true)}
                  onMouseLeave={() => setIsHover(false)}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-muted/50 hover:-translate-y-0.5">
                  <div
                     className={`flex aspect-square size-9 items-center justify-center rounded-md bg-muted text-primary transition-all duration-300 ${
                        isHover ? "animate-shake text-destructive/90" : "group-hover:text-primary/90"
                     }`}>
                     <TicketsPlane className={`size-5 transition-transform duration-300 ${isHover ? "scale-95" : "group-hover:scale-110"}`} />
                  </div>

                  <div className="flex flex-col leading-none">
                     <span
                        className={`font-semibold tracking-wide text-foreground transition-all duration-300 ${
                           isHover ? "text-destructive/90" : "group-hover:text-foreground"
                        }`}>
                        PlanKePentok
                     </span>
                     <span className={`text-xs font-medium text-muted-foreground transition-all duration-300 group-hover:text-primary/60`}>
                        v1.0 😭
                     </span>
                  </div>
               </Link>
            </SidebarMenuButton>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
