import ConfirmDialog from "@/components/confirm-submit";
import { DetailUsulanKegiatanSkeleton, IkuSkeleton, RencanaAnggaranBiayaSkeleton, TorSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useHeaderButton } from "@/hooks/store";
import { LinkButton } from "@/lib/helpers";
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/usulan-kegiatan";

const UsulanKegiatan = lazy(() => import("./usulan-kegiatan"));
const Iku = lazy(() => import("./iku"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya"));
const Dokumen = lazy(() => import("./dokumen"));
const Tor = lazy(() => import("@/components/usulan-kegiatan/tor/detail"));

export default function Page() {
   const { id } = useParams();

   const [statusUsulan, setStatusUsulan] = useState("");

   const { setButton } = useHeaderButton();

   useEffect(() => {
      setButton(
         <>
            <LinkButton label="Kembali" url="/usulan-kegiatan" type="actions" />
            {["", "draft", "perbaiki", "ditolak"].includes(statusUsulan) && (
               <ConfirmDialog
                  url="/usulan-kegiatan/usul"
                  refetchKey={[[`/usulan-kegiatan`], [`/usulan-kegiatan/${id}`]]}
                  formData={{ id_usulan: String(id) }}
                  actionButton={<Button className="text-dark bg-green-200 hover:text-white">Usul Kegiatan</Button>}
                  message="Apakah Anda yakin ingin mengajukan usulan kegiatan ini?"
               />
            )}
         </>
      );
      return () => {
         setButton(<div />);
      };
   }, [setButton, id, statusUsulan]);

   return (
      <>
         <Suspense fallback={<DetailUsulanKegiatanSkeleton />}>
            <UsulanKegiatan endpoint={endpoint} id={id} setStatusUsulan={setStatusUsulan} />
         </Suspense>
         <Suspense fallback={<TorSkeleton />}>
            <Tor id_usulan_kegiatan={String(id)} />
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
