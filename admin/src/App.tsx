import { AppHeaderSkeleton, AppSidebarSkeleton } from "@/components/loading-skeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Routes from "@/routes";
import { lazy, Suspense } from "react";

const AppSidebar = lazy(() => import("@/components/app-sidebar"));
const AppHeader = lazy(() => import("@/components/app-header"));

function App() {
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
