import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getValue } from "@/helpers/init";
import { useUnitKerja } from "@/helpers/simpeg";
import { FormDatePicker, FormInput, FormTextarea } from "@/lib/helpers";
import moment from "moment";
import { useUpdateInformasiUsulan, type FormData } from "./init";

interface FormInformasiUsulanProps {
   formData: FormData;
   setFormData: React.Dispatch<React.SetStateAction<FormData>>;
   setErrors: React.Dispatch<React.SetStateAction<FormData>>;
   errors: FormData;
   id_usulan_kegiatan?: string;
}

export default function FormInformasiUsulan({ formData, setFormData, errors, setErrors, id_usulan_kegiatan }: Readonly<FormInformasiUsulanProps>) {
   const { onSubmit, isPending } = useUpdateInformasiUsulan(id_usulan_kegiatan, formData, setErrors);
   const { data: unitPengusul, isLoading } = useUnitKerja(getValue(formData, "id_unit_pengusul"));

   return (
      <Card>
         <CardHeader>
            <CardTitle>Informasi Usulan Kegiatan</CardTitle>
            {["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string) && (
               <CardAction>
                  <Button variant="outline" disabled={isPending} onClick={onSubmit} className="-mt-1">
                     {isPending && <Spinner />}Simpan
                  </Button>
               </CardAction>
            )}
         </CardHeader>
         <CardContent>
            <div className="row">
               <FormInput
                  divClassName="col-12 col-md-2"
                  label="Kode"
                  name="kode"
                  value={getValue(formData, "kode")}
                  onChange={(value) => setFormData({ ...formData, kode: value })}
                  errors={errors}
                  disabled={true}
               />
               <FormInput
                  divClassName="col-12 col-md-3"
                  label="Nama Usulan Kegiatan"
                  name="nama"
                  value={getValue(formData, "nama")}
                  onChange={(value) => setFormData({ ...formData, nama: value })}
                  errors={errors}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
               <FormDatePicker
                  divClassName="col-12 col-md-2"
                  label="Waktu Mulai"
                  name="waktu_mulai"
                  value={getValue(formData, "waktu_mulai")}
                  onChange={(value) => setFormData({ ...formData, waktu_mulai: moment(value).format("YYYY-MM-DD") || null })}
                  errors={errors}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
               <FormDatePicker
                  divClassName="col-12 col-md-2"
                  label="Waktu Selesai"
                  name="waktu_selesai"
                  value={getValue(formData, "waktu_selesai")}
                  onChange={(value) => setFormData({ ...formData, waktu_selesai: moment(value).format("YYYY-MM-DD") || null })}
                  errors={errors}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
            </div>
            <div className="row">
               <FormInput
                  divClassName="col-12 col-md-3"
                  label="Unit Pengusul"
                  name="nama"
                  value={isLoading ? "Loading..." : unitPengusul}
                  disabled={true}
               />
               <FormInput
                  divClassName="col-12 col-md-3"
                  label="Tempat Pelaksanaan"
                  name="tempat_pelaksanaan"
                  value={getValue(formData, "tempat_pelaksanaan")}
                  onChange={(value) => setFormData({ ...formData, tempat_pelaksanaan: value })}
                  errors={errors}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
               <FormInput
                  divClassName="col-12 col-md-2"
                  label="Rencana Total Anggaran"
                  name="rencana_total_anggaran"
                  value={getValue(formData, "rencana_total_anggaran")}
                  onChange={(value) => setFormData({ ...formData, rencana_total_anggaran: value })}
                  errors={errors}
                  apakahFormatRupiah={true}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
            </div>
            <div className="row">
               <FormTextarea
                  divClassName="col-12 col-md-4"
                  label="Latar Belakang"
                  name="latar_belakang"
                  value={getValue(formData, "latar_belakang")}
                  onChange={(value) => setFormData({ ...formData, latar_belakang: value })}
                  errors={errors}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
               <FormTextarea
                  divClassName="col-12 col-md-4"
                  label="Tujuan"
                  name="tujuan"
                  value={getValue(formData, "tujuan")}
                  onChange={(value) => setFormData({ ...formData, tujuan: value })}
                  errors={errors}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
               <FormTextarea
                  divClassName="col-12 col-md-4"
                  label="Sasaran"
                  name="sasaran"
                  value={getValue(formData, "sasaran")}
                  onChange={(value) => setFormData({ ...formData, sasaran: value })}
                  errors={errors}
                  disabled={!["", "draft", "perbaiki", "ditolak"].includes(formData?.status_usulan as string)}
               />
            </div>
         </CardContent>
      </Card>
   );
}
