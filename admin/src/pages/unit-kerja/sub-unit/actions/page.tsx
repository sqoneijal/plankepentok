import { FormSubUnitSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { FormInput, FormSelect, LinkButton, SubmitButton } from "@/lib/helpers";
import { useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useOptionsParentUnit } from "./options";

type FormData = Record<string, string>;

const endpoint = "/unit-kerja/sub-unit";

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
   const { parentUnit, isLoadingParentUnit } = useOptionsParentUnit();

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const data = covertToSTring(results) as FormData;
         const level = data.level;
         const id_parent = `id_${level}`;

         setFormData({
            ...data,
            id_parent: `${data[id_parent]}-${level}`,
         });
      }
      return () => {};
   }, [id, isLoading, results]);

   if (isLoading || isLoadingParentUnit) {
      return <FormSubUnitSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormSelect
                     useCommand={true}
                     divClassName="col-12 col-md-6"
                     label="Parent Unit"
                     value={getValue(formData, "id_parent")}
                     onChange={(value) => setFormData((prev) => ({ ...prev, id_parent: value }))}
                     name="id_parent"
                     errors={errors}
                     options={parentUnit.map((row: FormData) => ({
                        value: `${row.id}-${row.level}`,
                        label: row.nama,
                     }))}
                  />
                  <FormInput
                     divClassName="col-12 col-md-6"
                     label="Nama Sub Unit"
                     value={getValue(formData, "nama")}
                     onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                     name="nama"
                     errors={errors}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
