import { DetailUsulanKegiatanSkeleton } from "@/components/loading-skeleton";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { lazy, Suspense } from "react";
import { useParams } from "react-router";

const endpoint = "/realisasi";

const UsulanKegiatan = lazy(() => import("./usulan-kegiatan"));
const Iku = lazy(() => import("./iku"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya"));
const Dokumen = lazy(() => import("./dokumen"));

export default function Page() {
   const { id } = useParams() as { id: string };

   const { results, isLoading } = useGetQueryDetail(endpoint, id);

   if (isLoading) {
      return <DetailUsulanKegiatanSkeleton />;
   }

   return (
      <Suspense fallback={<DetailUsulanKegiatanSkeleton />}>
         <UsulanKegiatan results={results} />
         <Iku results={results.relasi_usulan_iku} isLoading={isLoading} />
         <RencanaAnggaranBiaya results={results.rab_detail} isLoading={isLoading} />
         <Dokumen results={results.dokumen_pendukung} isLoading={isLoading} />
      </Suspense>
   );
}
