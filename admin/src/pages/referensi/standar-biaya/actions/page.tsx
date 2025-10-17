import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getValue } from "@/helpers/init";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/lib/helpers";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useCreateData, useGetDetailData, useInitPage, useOptions, useUpdateData } from "./init";

export default function Page() {
   const { id_standar_biaya } = useParams();
   const isEdit = !!id_standar_biaya;

   const { kategoriSBM, unitSatuan, isLoadingKategoriSBM, isLoadingUnitSatuan } = useOptions();

   const { formData, setFormData, errors, setErrors } = useInitPage();
   const { content, isLoading } = useGetDetailData(id_standar_biaya);

   const createData = useCreateData(formData, setErrors);
   const updateData = useUpdateData(id_standar_biaya, formData, setErrors);

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

   if (isLoading || isLoadingKategoriSBM || isLoadingUnitSatuan) {
      return <LoadingSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormInput
                     divClassName="col-12 col-md-2"
                     label="Kode Standar Biaya"
                     name="kode"
                     onChange={(value) => setFormData((prev) => ({ ...prev, kode: value }))}
                     value={getValue(formData, "kode")}
                     errors={errors}
                  />
                  <FormInput
                     divClassName="col-12 col-md-2"
                     label="Nama Standar Biaya"
                     name="nama"
                     onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                     value={getValue(formData, "nama")}
                     errors={errors}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-4"
                     label="Kategori SBM"
                     name="id_kategori"
                     options={kategoriSBM.map((row: Record<string, string>) => ({
                        value: row.id.toString(),
                        label: row.nama,
                        tooltipContent: row.deskripsi,
                     }))}
                     onChange={(value) => setFormData((prev) => ({ ...prev, id_kategori: value }))}
                     value={getValue(formData, "id_kategori")}
                     errors={errors}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Unit Satuan"
                     name="id_unit_satuan"
                     options={unitSatuan.map((row: Record<string, string>) => ({
                        value: row.id.toString(),
                        label: row.nama,
                        tooltipContent: row.deskripsi,
                     }))}
                     onChange={(value) => setFormData((prev) => ({ ...prev, id_unit_satuan: value }))}
                     value={getValue(formData, "id_unit_satuan")}
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
