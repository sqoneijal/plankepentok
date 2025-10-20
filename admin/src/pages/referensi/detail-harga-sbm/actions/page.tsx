import { FormDetailHargaSBMSkeleton } from "@/components/loading-skeleton";
import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { FormDatePicker, FormInput, FormSelect, LinkButton, SubmitButton } from "@/lib/helpers";
import { useGetQueryDetail, useSubmitData } from "@/lib/utils";
import moment from "moment";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useOptionsStandarBiaya, useOptionsTahunAnggaran, useOptionsUnitSatuan } from "./options";

const endpoint = "/referensi/detail-harga-sbm";

type FormData = Record<string, string>;

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, isLoading } = useGetQueryDetail(endpoint, id);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });
   const { tahunAnggaran, isLoadingTahunAnggaran } = useOptionsTahunAnggaran();
   const { standarBiaya, isLoadingStandarBiaya } = useOptionsStandarBiaya();
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

   if (isLoading || isLoadingTahunAnggaran || isLoadingStandarBiaya || isLoadingUnitSatuan) {
      return <FormDetailHargaSBMSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Tahun Anggaran"
                     value={getValue(formData, "tahun_anggaran")}
                     name="tahun_anggaran"
                     onChange={(value) => setFormData((prev) => ({ ...prev, tahun_anggaran: value }))}
                     errors={errors}
                     options={tahunAnggaran.map((row: Record<string, string>) => ({ value: row.tahun_anggaran, label: row.tahun_anggaran }))}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-4"
                     label="Standar Biaya"
                     value={getValue(formData, "id_standar_biaya")}
                     name="id_standar_biaya"
                     onChange={(value) => setFormData((prev) => ({ ...prev, id_standar_biaya: value }))}
                     errors={errors}
                     options={standarBiaya.map((row: Record<string, string>) => ({
                        value: row.id.toString(),
                        label: `${row.kode} - ${row.nama}`,
                        tooltipContent: row.deskripsi,
                     }))}
                  />
                  <FormInput
                     divClassName="col-12 col-md-2"
                     label="Harga Satuan"
                     value={getValue(formData, "harga_satuan")}
                     name="harga_satuan"
                     onChange={(value) => setFormData((prev) => ({ ...prev, harga_satuan: value }))}
                     errors={errors}
                     apakahFormatRupiah={true}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Unit Satuan"
                     value={getValue(formData, "id_satuan")}
                     name="id_satuan"
                     onChange={(value) => setFormData((prev) => ({ ...prev, id_satuan: value }))}
                     errors={errors}
                     options={unitSatuan.map((row: Record<string, string>) => ({
                        value: row.id.toString(),
                        label: row.nama,
                        tooltipContent: row.deskripsi,
                     }))}
                  />
               </div>
               <div className="row">
                  <FormDatePicker
                     divClassName="col-12 col-md-2"
                     label="Tanggal Mulai Efektif"
                     value={getValue(formData, "tanggal_mulai_efektif")}
                     name="tanggal_mulai_efektif"
                     onChange={(value) => setFormData((prev) => ({ ...prev, tanggal_mulai_efektif: moment(value).format("YYYY-MM-DD") }))}
                     errors={errors}
                  />
                  <FormDatePicker
                     divClassName="col-12 col-md-2"
                     label="Tanggal Akhir Efektif"
                     value={getValue(formData, "tanggal_akhir_efektif")}
                     name="tanggal_akhir_efektif"
                     onChange={(value) => setFormData((prev) => ({ ...prev, tanggal_akhir_efektif: moment(value).format("YYYY-MM-DD") }))}
                     errors={errors}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Status Validasi"
                     value={getValue(formData, "status_validasi")}
                     name="status_validasi"
                     onChange={(value) => setFormData((prev) => ({ ...prev, status_validasi: value }))}
                     errors={errors}
                     options={[
                        { value: "draft", label: "Draft" },
                        { value: "valid", label: "Valid" },
                        { value: "kadaluarsa", label: "Kadaluarsa" },
                     ]}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbaharui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
