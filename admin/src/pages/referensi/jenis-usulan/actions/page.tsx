import { FormJenisUsulanSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { useSubmitData } from "@/hooks/useSubmitData";
import { FormInput, FormSelect, LinkButton, SubmitButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/referensi/jenis-usulan";

export default function Page() {
   const { setButton } = useHeaderButton();
   const { id } = useParams();
   const isEdit = !!id;

   const [formData, setFormData] = useState({});
   const [errors, setErrors] = useState({});

   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, isLoading } = useGetQueryDetail(endpoint, id);

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const converted = covertToSTring(results);
         setFormData({ ...converted });
      }
      return () => {};
   }, [id, isLoading, results]);

   if (isLoading) {
      return <FormJenisUsulanSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormInput
                     divClassName="col-12 col-md-3"
                     label="Nama Jenis"
                     value={getValue(formData, "nama")}
                     name="nama"
                     onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                     errors={errors}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Status"
                     value={getValue(formData, "is_aktif")}
                     name="is_aktif"
                     onChange={(value) => setFormData((prev) => ({ ...prev, is_aktif: value }))}
                     errors={errors}
                     options={[
                        { value: "AKTIF", label: "Aktif" },
                        { value: "TIDAK_AKTIF", label: "Tidak Aktif" },
                     ]}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbaharui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
