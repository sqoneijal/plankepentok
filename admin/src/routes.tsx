import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Suspense } from "react";
import { Routes as ReactRoutes, Route } from "react-router";

import { route_dashboard } from "@/routes/dashboard";
import { route_master_iku } from "./routes/master-iku";
import { route_pagu_anggaran } from "./routes/pagu-anggaran";
import { route_pengaturan } from "./routes/pengaturan";
import { route_referensi } from "./routes/referensi";
import { route_unit_kerja } from "./routes/unit-kerja";
import { route_usulan_kegiatan } from "./routes/usulan-kegiatan";
import { route_verifikasi_usulan } from "./routes/verifikasi-usulan";

export default function Routes() {
   const allRoutes = [
      route_dashboard,
      route_referensi,
      route_usulan_kegiatan,
      route_unit_kerja,
      route_master_iku,
      route_verifikasi_usulan,
      route_pagu_anggaran,
      route_pengaturan,
   ];

   return (
      <div className="mt-3">
         <Suspense fallback={<LoadingSkeleton />}>
            <ReactRoutes>
               {allRoutes.flat().map((item) => {
                  if (!item.element) {
                     return null;
                  }

                  return <Route key={item.key} path={item.path} element={item.element} />;
               })}
            </ReactRoutes>
         </Suspense>
      </div>
   );
}
