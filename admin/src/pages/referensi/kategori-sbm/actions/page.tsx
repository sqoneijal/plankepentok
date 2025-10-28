import { FormKategoriSBMSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { FormInput, FormTextarea, LinkButton, SubmitButton } from "@/lib/helpers";
import { useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

type FormData = Record<string, string>;
const endpoint = "/referensi/kategori-sbm";

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, isLoading } = useGetQueryDetail(endpoint, id);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const data = covertToSTring(results);
         setFormData({ ...(data as FormData) });
      }
      return () => {};
   }, [id, isLoading, results]);

   if (isLoading) {
      return <FormKategoriSBMSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormInput
                     divClassName="col-12 col-md-2"
                     label="Kode Kategori SBM"
                     name="kode"
                     onChange={(value) => setFormData((prev) => ({ ...prev, kode: value }))}
                     value={getValue(formData, "kode")}
                     errors={errors}
                  />
                  <FormInput
                     divClassName="col-12 col-md-10"
                     label="Nama Kategori SBM"
                     name="nama"
                     onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                     value={getValue(formData, "nama")}
                     errors={errors}
                  />
               </div>
               <div className="row">
                  <FormTextarea
                     divClassName="col-12"
                     label="Deskripsi"
                     name="deskripsi"
                     value={getValue(formData, "deskripsi")}
                     onChange={(value) => setFormData((prev) => ({ ...prev, deskripsi: value }))}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
