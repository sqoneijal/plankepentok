import { lazy, Suspense } from "react";

const SectionCards = lazy(() => import("./section-cards"));

export default function Page() {
   return (
      <Suspense
         fallback={
            <div className="min-h-screen flex items-center justify-center from-slate-50 to-slate-100">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Memuat data...</p>
               </div>
            </div>
         }>
         <SectionCards />
      </Suspense>
   );
}
