import { AppHeaderSkeleton, AppSidebarSkeleton, LoadingSkeleton } from "@/components/loading-skeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Routes from "@/routes";
import { lazy, Suspense, useEffect } from "react";
import { objectLength } from "./helpers/init";
import { UseAuth } from "./hooks/auth-context";
import { useGetQueryDetail } from "./hooks/useGetQueryDetail";

const AppSidebar = lazy(() => import("@/components/app-sidebar"));
const AppHeader = lazy(() => import("@/components/app-header"));

function App() {
   const { user, logout } = UseAuth();

   const { results, isLoading } = useGetQueryDetail("/user-validate", user?.preferred_username);

   useEffect(() => {
      if (!isLoading && !objectLength(results)) {
         logout();
      }
      return () => {};
   }, [isLoading, results, logout]);

   if (isLoading) {
      return <LoadingSkeleton />;
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
