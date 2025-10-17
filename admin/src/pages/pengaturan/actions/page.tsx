import { LoadingSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue, getYearOptions } from "@/helpers/init";
import { FormInput, FormSelect, SubmitButton } from "@/lib/helpers";
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
         setFormData({ ...(converted as FormData) });
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
                  <div className="col-12 col-md-2">
                     <FormSelect
                        label="Tahun Anggaran"
                        value={getValue(formData, "tahun_anggaran")}
                        onChange={(value) => setFormData({ ...formData, tahun_anggaran: value })}
                        name="tahun_anggaran"
                        errors={errors}
                        options={getYearOptions()}
                     />
                  </div>
                  <div className="col-12 col-md-3">
                     <FormInput
                        label="Total Pagu"
                        value={getValue(formData, "total_pagu")}
                        onChange={(value) => setFormData({ ...formData, total_pagu: value })}
                        name="total_pagu"
                        errors={errors}
                        apakahFormatRupiah={true}
                     />
                  </div>
                  <div className="col-12 col-md-2">
                     <FormSelect
                        label="Status"
                        value={getValue(formData, "is_aktif")}
                        onChange={(value) => setFormData({ ...formData, is_aktif: value })}
                        name="is_aktif"
                        errors={errors}
                        options={[
                           { value: "true", label: "Aktif" },
                           { value: "false", label: "Tidak Aktif" },
                        ]}
                     />
                  </div>
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
