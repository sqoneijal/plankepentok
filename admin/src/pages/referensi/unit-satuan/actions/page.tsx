import { FormUnitSatuanSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { FormInput, FormSelect, FormTextarea, LinkButton, SubmitButton } from "@/lib/helpers";
import { useGetQueryDetail, useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

type FormData = Record<string, string>;

const endpoint = "/referensi/unit-satuan";

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   const { results, isLoading } = useGetQueryDetail(endpoint, id);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const converted = covertToSTring(results);
         setFormData({ ...(converted as FormData) });
      }
   }, [isLoading, results, id]);

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   if (isLoading) {
      return <FormUnitSatuanSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormInput
                     divClassName="col-12 col-md-10"
                     label="Nama Unit Satuan"
                     value={formData.nama}
                     name="nama"
                     onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                     errors={errors}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Status Unit Satuan"
                     value={formData.aktif}
                     name="aktif"
                     onChange={(value) => setFormData((prev) => ({ ...prev, aktif: value }))}
                     errors={errors}
                     options={[
                        { value: "true", label: "Aktif" },
                        { value: "false", label: "Tidak Aktif" },
                     ]}
                  />
               </div>
               <div className="row">
                  <FormTextarea
                     divClassName="col-12"
                     label="Deskripsi"
                     name="deskripsi"
                     value={formData.deskripsi}
                     onChange={(value) => setFormData((prev) => ({ ...prev, deskripsi: value }))}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
