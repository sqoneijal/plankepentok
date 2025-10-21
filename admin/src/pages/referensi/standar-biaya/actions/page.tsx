import { FormStandarBiayaSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { FormInput, FormSelect, FormTextarea, LinkButton, SubmitButton } from "@/lib/helpers";
import { useGetQueryDetail, useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useOptionsKategoriSBM, useOptionsUnitSatuan } from "./options";

const endpoint = "/referensi/standar-biaya";

type FormData = Record<string, string>;

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
   const { kategoriSBM, isLoadingKategoriSBM } = useOptionsKategoriSBM();
   const { unitSatuan, isLoadingUnitSatuan } = useOptionsUnitSatuan();

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const data = covertToSTring(results);
         setFormData({ ...(data as FormData) });
      }
      return () => {};
   }, [id, isLoading, results]);

   if (isLoading || isLoadingKategoriSBM || isLoadingUnitSatuan) {
      return <FormStandarBiayaSkeleton />;
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
