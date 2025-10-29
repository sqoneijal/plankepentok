import { DashboardSectionCardsSkeleton } from "@/components/loading-skeleton";
import { lazy, Suspense } from "react";

const SectionCards = lazy(() => import("./section-cards"));
const StatusVerifikasi = lazy(() => import("./status-verifikasi"));

const endpoint = "/dashboard";

export default function Page() {
   return (
      <>
         <Suspense fallback={<DashboardSectionCardsSkeleton />}>
            <SectionCards endpoint={endpoint} />
         </Suspense>
         <Suspense>
            <StatusVerifikasi endpoint={endpoint} />
         </Suspense>
      </>
   );
}
