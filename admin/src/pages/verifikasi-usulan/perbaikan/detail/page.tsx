import { DetailUsulanKegiatanSkeleton } from "@/components/loading-skeleton";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { lazy, Suspense } from "react";
import { useParams } from "react-router";

const endpoint = "/verifikasi-usulan/perbaikan";

const UsulanKegiatan = lazy(() => import("./usulan-kegiatan"));
const Iku = lazy(() => import("./iku"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya"));
const Dokumen = lazy(() => import("./dokumen"));

export default function Page() {
   const { id_usulan_kegiatan } = useParams();

   const { results, isLoading } = useGetQueryDetail(endpoint, id_usulan_kegiatan);

   if (isLoading) {
      return <DetailUsulanKegiatanSkeleton />;
   }

   if (!results) {
      return <div>Data tidak ditemukan</div>;
   }

   return (
      <Suspense fallback={<DetailUsulanKegiatanSkeleton />}>
         <UsulanKegiatan results={results} />
         <Iku results={results?.relasi_usulan_iku} isLoading={isLoading} verifikasi={results?.verifikasi} />
         <RencanaAnggaranBiaya
            results={results?.rab_detail}
            isLoading={isLoading}
            verifikasi={results?.verifikasi}
            anggaran_disetujui={results?.anggaran_disetujui?.jumlah}
         />
         <Dokumen results={results?.dokumen_pendukung} isLoading={isLoading} verifikasi={results?.verifikasi} />
      </Suspense>
   );
}
