import { DetailUsulanKegiatanSkeleton, IkuSkeleton, RencanaAnggaranBiayaSkeleton } from "@/components/loading-skeleton";
import { lazy, Suspense } from "react";
import { useParams } from "react-router";

const endpoint = "/usulan-kegiatan";

const UsulanKegiatan = lazy(() => import("./usulan-kegiatan"));
const Iku = lazy(() => import("./iku"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya"));
const Dokumen = lazy(() => import("./dokumen"));

export default function Page() {
   const { id } = useParams();

   return (
      <>
         <Suspense fallback={<DetailUsulanKegiatanSkeleton />}>
            <UsulanKegiatan endpoint={endpoint} id={id} />
         </Suspense>
         <Suspense fallback={<IkuSkeleton />}>
            <Iku endpoint={endpoint} id={id} />
         </Suspense>
         <Suspense fallback={<RencanaAnggaranBiayaSkeleton />}>
            <RencanaAnggaranBiaya endpoint={endpoint} id={id} />
         </Suspense>
         <Suspense>
            <Dokumen endpoint={endpoint} id={id} />
         </Suspense>
      </>
   );
}
