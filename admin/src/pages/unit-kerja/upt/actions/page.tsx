import { LoadingSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue } from "@/helpers/init";
import { FormInput, SubmitButton } from "@/lib/helpers";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useCreateData, useGetDetailData, useInitPage, useUpdateData, type FormData } from "./init";

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
         const converted = covertToSTring(content);
         setFormData(converted as FormData);
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
                     divClassName="col-12"
                     label="Nama UPT"
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
