import { DetailUsulanKegiatanSkeleton } from "@/components/loading-skeleton";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { LinkButton } from "@/lib/helpers";
import { lazy, Suspense, useEffect } from "react";
import { useParams } from "react-router";

const endpoint = "/verifikasi-usulan/pengajuan";

const UsulanKegiatan = lazy(() => import("./usulan-kegiatan"));
const Iku = lazy(() => import("./iku"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya"));
const Dokumen = lazy(() => import("./dokumen"));

export default function Page() {
   const { id } = useParams();
   const { setButton } = useHeaderButton();

   const { results, isLoading } = useGetQueryDetail(endpoint, id);

   useEffect(() => {
      setButton(<LinkButton label="Kembali" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton, id]);

   if (isLoading) {
      return <DetailUsulanKegiatanSkeleton />;
   }

   if (!results) {
      return <div>Data tidak ditemukan</div>;
   }

   return (
      <Suspense fallback={<DetailUsulanKegiatanSkeleton />}>
         <UsulanKegiatan results={results} />
         <Iku results={results?.relasi_usulan_iku} isLoading={isLoading} endpoint={endpoint} id_usulan={id as string} />
         <RencanaAnggaranBiaya results={results?.rab_detail} isLoading={isLoading} endpoint={endpoint} id_usulan={id as string} />
         <Dokumen results={results?.dokumen_pendukung} isLoading={isLoading} endpoint={endpoint} id_usulan={id as string} />
      </Suspense>
   );
}
