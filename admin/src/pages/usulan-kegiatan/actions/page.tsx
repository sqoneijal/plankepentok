import { DokumenSkeleton, FormInformasiUsulanSkeleton, IkuSkeleton, RencanaAnggaranBiayaSkeleton } from "@/components/loading-skeleton";
import { lazy, Suspense } from "react";
import { useParams } from "react-router";
import { useInitPage } from "./init";

const InformasiUsulan = lazy(() => import("./form-informasi-usulan"));
const Iku = lazy(() => import("./iku/page"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya/page"));
const Dokumen = lazy(() => import("./dokumen/page"));

export default function Page() {
   const { id, id_rab } = useParams();
   const { formData, setFormData, errors, setErrors } = useInitPage(id);

   return (
      <>
         <Suspense fallback={<FormInformasiUsulanSkeleton />}>
            <InformasiUsulan formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} id_usulan_kegiatan={id} />
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
