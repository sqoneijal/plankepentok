import ConfirmDialog from "@/components/confirm-submit";
import { DokumenSkeleton, FormInformasiUsulanSkeleton, IkuSkeleton, RencanaAnggaranBiayaSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useHeaderButton } from "@/hooks/store";
import { LinkButton } from "@/lib/helpers";
import { lazy, Suspense, useEffect } from "react";
import { useParams } from "react-router";
import { useInitPage } from "./init";

const InformasiUsulan = lazy(() => import("./form-informasi-usulan"));
const Iku = lazy(() => import("./iku/page"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya/page"));
const Dokumen = lazy(() => import("./dokumen/page"));

const endpoint = "/usulan-kegiatan";

export default function Page() {
   const { id, id_rab } = useParams();
   const { formData, setFormData, errors, setErrors } = useInitPage(id);

   const { setButton } = useHeaderButton();

   useEffect(() => {
      setButton(
         <>
            <LinkButton label="Kembali" url="/usulan-kegiatan" type="actions" />
            <ConfirmDialog
               url="/usulan-kegiatan/usul"
               refetchKey={[[`/usulan-kegiatan`], [`/usulan-kegiatan/${id}`]]}
               formData={{ id_usulan: String(id) }}
               actionButton={<Button className="text-dark bg-green-200 hover:text-white">Usul Kegiatan</Button>}
               message="Apakah Anda yakin ingin mengajukan usulan kegiatan ini?"
            />
         </>
      );
      return () => {
         setButton(<div />);
      };
   }, [setButton, id]);

   return (
      <>
         <Suspense fallback={<FormInformasiUsulanSkeleton />}>
            <InformasiUsulan
               formData={formData}
               setFormData={setFormData}
               errors={errors}
               setErrors={setErrors}
               id_usulan_kegiatan={id}
               endpoint={endpoint}
            />
         </Suspense>
         <Suspense fallback={<IkuSkeleton />}>
            <Iku id_usulan_kegiatan={id} />
         </Suspense>
         <Suspense fallback={<RencanaAnggaranBiayaSkeleton />}>
            <RencanaAnggaranBiaya id_usulan_kegiatan={id} id_rab_detail={id_rab} />
         </Suspense>
         <Suspense fallback={<DokumenSkeleton />}>
            <Dokumen id_usulan_kegiatan={id} />
         </Suspense>
      </>
   );
}
