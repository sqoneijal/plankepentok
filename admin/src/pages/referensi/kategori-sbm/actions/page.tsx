import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getValue } from "@/helpers/init";
import { FormInput, FormTextarea, SubmitButton } from "@/lib/helpers";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useCreateData, useGetDetailData, useInitPage, useUpdateData } from "./init";

export default function Page() {
   const { id_kategori_sbm } = useParams();
   const isEdit = !!id_kategori_sbm;

   const { formData, setFormData, errors, setErrors } = useInitPage();
   const { content, isLoading } = useGetDetailData(id_kategori_sbm);

   const createData = useCreateData(formData, setErrors);
   const updateData = useUpdateData(id_kategori_sbm, formData, setErrors);

   const { onSubmit, isPending } = isEdit ? updateData : createData;

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (!isLoading && Object.keys(content).length > 0) {
         setFormData(content);
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
