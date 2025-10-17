import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getValue } from "@/helpers/init";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/lib/helpers";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useCreateData, useGetDetailData, useInitPage, useUpdateData } from "./init";

export default function Page() {
   const { id_unit_satuan } = useParams();
   const isEdit = !!id_unit_satuan;

   const { formData, setFormData, errors, setErrors } = useInitPage();
   const { content, isLoading } = useGetDetailData(id_unit_satuan);

   const createData = useCreateData(formData, setErrors);
   const updateData = useUpdateData(id_unit_satuan, formData, setErrors);

   const { onSubmit, isPending } = isEdit ? updateData : createData;

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (!isLoading && Object.keys(content).length > 0) {
         setFormData({
            ...content,
            aktif: content?.aktif ? "true" : "false",
         });
      }
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isLoading, content]);

   if (isLoading) {
      return <LoadingSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormInput
                     divClassName="col-12 col-md-10"
                     label="Nama Unit Satuan"
                     value={getValue(formData, "nama")}
                     name="nama"
                     onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                     errors={errors}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Status Unit Satuan"
                     value={getValue(formData, "aktif")}
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
