import { FormSubUnitSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue } from "@/helpers/init";
import { FormInput, FormSelect, SubmitButton } from "@/lib/helpers";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useCreateData, useGetDetailData, useInitPage, useOptions, useUpdateData, type FormData } from "./init";

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { formData, setFormData, errors, setErrors } = useInitPage();
   const { results, isLoading } = useOptions();
   const { detailData, isLoadingDetail } = useGetDetailData(id);

   const createData = useCreateData(formData, setErrors);
   const updateData = useUpdateData(id, formData, setErrors);

   const { onSubmit, isPending } = isEdit ? updateData : createData;

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (!isLoadingDetail && Object.keys(detailData).length > 0) {
         const converted = covertToSTring(detailData);
         const level = converted.level as string;
         const parentObj = converted[level] as Record<string, unknown>;
         const parentId = parentObj.id as string;
         setFormData({
            id_parent: String(`${parentId}-${level}`),
            nama: String(converted?.nama),
         });
      }

      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [detailData, isLoadingDetail]);

   if (isLoading || isLoadingDetail) {
      return <FormSubUnitSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormSelect
                     divClassName="col-12 col-md-6"
                     label="Parent Unit"
                     value={getValue(formData, "id_parent")}
                     onChange={(value) => setFormData((prev) => ({ ...prev, id_parent: value }))}
                     name="id_parent"
                     errors={errors}
                     options={results.map((row: FormData) => ({
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
