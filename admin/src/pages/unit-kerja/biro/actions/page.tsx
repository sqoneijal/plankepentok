import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getValue } from "@/helpers/init";
import { FormInput, SubmitButton } from "@/lib/helpers";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useCreateData, useGetDetailData, useInitPage, useUpdateData } from "./init";

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { formData, setFormData, errors, setErrors } = useInitPage();
   const { content, isLoading } = useGetDetailData(id);

   const createData = useCreateData(formData, setErrors);
   const updateData = useUpdateData(id, formData, setErrors);

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
                  <div className="col-12">
                     <FormInput
                        label="Nama Biro"
                        value={getValue(formData, "nama")}
                        onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                        name="nama"
                        errors={errors}
                     />
                  </div>
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
