import { FormInformasiUsulanSkeleton } from "@/components/loading-skeleton";
import { lazy, Suspense } from "react";
import { useParams } from "react-router";
import { useInitPage } from "./init";

const InformasiUsulan = lazy(() => import("./form-informasi-usulan"));
const Iku = lazy(() => import("./iku/page"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya/page"));

export default function Page() {
   const { id_usulan_kegiatan, id_rab_detail } = useParams();
   const { formData, setFormData, errors, setErrors } = useInitPage(id_usulan_kegiatan);

   return (
      <>
         <Suspense fallback={<FormInformasiUsulanSkeleton />}>
            <InformasiUsulan
               formData={formData}
               setFormData={setFormData}
               errors={errors}
               setErrors={setErrors}
               id_usulan_kegiatan={id_usulan_kegiatan}
            />
         </Suspense>
         <Suspense>
            <Iku id_usulan_kegiatan={id_usulan_kegiatan} />
         </Suspense>
         <Suspense>
            <RencanaAnggaranBiaya id_usulan_kegiatan={id_usulan_kegiatan} id_rab_detail={id_rab_detail} />
         </Suspense>
      </>
   );
}
