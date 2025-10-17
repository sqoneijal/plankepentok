import { FormSelect, FormText } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { btn_loading, formatRupiah, getValue, getYearOptions } from "@/helpers/init";
import { useEffect } from "react";
import { useActions, useEditData } from "./init";

export default function Page() {
   const { data, isLoading } = useEditData();
   const { handleSubmit, submit, formData, setFormData, errors } = useActions();

   useEffect(() => {
      if (data?.data) {
         setFormData({ ...data?.data, total_pagu: formatRupiah(data?.data?.total_pagu || "") });
      }
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [data]);

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center from-slate-50 to-slate-100">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
               <p className="text-gray-600 font-medium">Memuat data...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-2">
                     <FormSelect
                        label="Tahun Anggaran"
                        name="tahun_anggaran"
                        options={getYearOptions()}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, tahun_anggaran: value }))}
                        value={getValue(formData, "tahun_anggaran")}
                        errors={errors}
                        disabled={!!getValue(formData, "id")}
                     />
                  </div>
                  <div className="col-12 col-md-3">
                     <FormText
                        label="Total Pagu Anggaran"
                        name="total_pagu"
                        onChange={(value) => setFormData((prev) => ({ ...prev, total_pagu: formatRupiah(value) }))}
                        value={getValue(formData, "total_pagu")}
                        errors={errors}
                     />
                  </div>
                  <div className="col-12 col-md-2">
                     <FormSelect
                        label="Status"
                        name="is_aktif"
                        options={[
                           { value: "t", label: "Aktif" },
                           { value: "f", label: "Tidak Aktif" },
                        ]}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, is_aktif: value }))}
                        value={getValue(formData, "is_aktif")}
                        errors={errors}
                     />
                  </div>
               </div>
               <Button type="submit" size="sm" disabled={submit.isPending}>
                  {submit.isPending ? btn_loading() : "Simpan"}
               </Button>
            </form>
         </div>
      </div>
   );
}
