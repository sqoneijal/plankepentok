import { FormPengaturanSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue, getYearOptions } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { FormInput, FormSelect, LinkButton, SubmitButton } from "@/lib/helpers";
import { useGetQueryDetail, useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/pengaturan";

export type FormData = Record<string, string>;

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   const { results, isLoading } = useGetQueryDetail(endpoint, id);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   useEffect(() => {
      if (id && !isLoading && Object.keys(results).length > 0) {
         const data = covertToSTring(results);
         setFormData({ ...(data as FormData) });
      }
      return () => {};
   }, [id, results, isLoading]);

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   if (isLoading) {
      return <FormPengaturanSkeleton />;
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
