import { AppHeaderSkeleton, AppSidebarSkeleton, LoadingSkeleton } from "@/components/loading-skeleton";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { objectLength } from "@/helpers/init";
import { UseAuth } from "@/hooks/auth-context";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import Routes from "@/routes";
import { ChevronRightIcon } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";
import type { UserValidationItem } from "./types/init";

const AppSidebar = lazy(() => import("@/components/app-sidebar"));
const AppHeader = lazy(() => import("@/components/app-header"));

function App() {
   const { user, logout } = UseAuth();

   const { results, isLoading } = useGetQueryDetail("/user-validate", user?.preferred_username);

   useEffect(() => {
      if (!isLoading && !objectLength(results)) {
         // logout();
      }
      return () => {};
   }, [isLoading, results, logout]);

   if (isLoading) {
      return <LoadingSkeleton />;
   }

   const roles = results.map((row: UserValidationItem) => {
      return row.roles;
   });

   localStorage.setItem("roles", JSON.stringify(roles));

   if (results.length > 1 && !localStorage.getItem("selected_roles")) {
      return (
         <AlertDialog open={true}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Pilih mau login sebagai user apa?</AlertDialogTitle>
               </AlertDialogHeader>
               {results.map((row: UserValidationItem) => {
                  return (
                     <div className="flex w-full max-w-md flex-col gap-6" key={row.id}>
                        <Item
                           variant="outline"
                           size="sm"
                           asChild
                           onClick={() => {
                              localStorage.setItem("selected_roles", JSON.stringify(row.roles));
                              location.reload();
                           }}>
                           <div className="cursor-pointer hover:bg-neutral-300">
                              <ItemContent>
                                 <ItemTitle>{row.roles.nama}</ItemTitle>
                              </ItemContent>
                              <ItemActions>
                                 <ChevronRightIcon className="size-4" />
                              </ItemActions>
                           </div>
                        </Item>
                     </div>
                  );
               })}
            </AlertDialogContent>
         </AlertDialog>
      );
   }

   return (
      <SidebarProvider>
         <Suspense fallback={<AppSidebarSkeleton />}>
            <AppSidebar />
         </Suspense>
         <SidebarInset>
            <Suspense fallback={<AppHeaderSkeleton />}>
               <AppHeader />
            </Suspense>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
               <div className="@container/main flex flex-1 flex-col gap-2">
                  <Routes />
               </div>
            </div>
         </SidebarInset>
      </SidebarProvider>
   );
}

export default App;
