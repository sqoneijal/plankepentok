import BundledEditor from "@/components/bundle-editor";
import { TorSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useGetQuery } from "@/hooks/useGetQuery";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { usePutMutation } from "@/hooks/usePutMutation";
import { FormInput, FormMultiSelect } from "@/lib/helpers";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const getValueMulti = (original: Record<string, unknown>, field: string): Array<string> => {
   const val = original?.[field];
   if (Array.isArray(val)) return val as Array<string>;
   return [];
};

type FormData = Record<string, string | Array<string>>;

export default function Form({ id_usulan_kegiatan }: Readonly<{ id_usulan_kegiatan: string }>) {
   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<Record<string, string | null>>({});

   const { results, isLoading } = useGetQueryDetail(`/usulan-kegiatan/tor`, id_usulan_kegiatan);
   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/usulan-kegiatan/tor/${id_usulan_kegiatan}`, (data) => covertToSTring(data));
   const { results: daftarJenisKeluaran, isLoading: isLoadingJenisKeluaran } = useGetQuery(`/options/jenis-keluaran-tor`);
   const { results: daftarPenerimaManfaat, isLoading: isLoadingPenerimaManfaat } = useGetQuery(`/options/penerima-manfaat-tor`);
   const { results: daftarVolumeKeluaran, isLoading: isLoadingVolumeKeluaran } = useGetQuery(`/options/volume-keluaran-tor`);

   useEffect(() => {
      if (!isLoading && objectLength(results)) {
         setFormData({
            ...results,
            jenis_keluaran: results.jenis_keluaran_tor?.map((row: { id_mst_jenis_keluaran_tor: number }) => row.id_mst_jenis_keluaran_tor),
            volume_keluaran: results.volume_keluaran_tor?.map((row: { id_mst_volume_keluaran_tor: number }) => row.id_mst_volume_keluaran_tor),
            penerima_manfaat: results.penerima_manfaat_tor?.map((row: { id_mst_penerima_manfaat_tor: number }) => row.id_mst_penerima_manfaat_tor),
            dasar_hukum: decode(results?.dasar_hukum),
            gambaran_umum: decode(results?.gambaran_umum),
            alasan_kegiatan: decode(results?.alasan_kegiatan),
            uraian_kegiatan: decode(results?.uraian_kegiatan),
            batasan_kegiatan: decode(results?.batasan_kegiatan),
            maksud_kegiatan: decode(results?.maksud_kegiatan),
            tujuan_kegiatan: decode(results?.tujuan_kegiatan),
            indikator_keluaran: decode(results?.indikator_keluaran),
            keluaran: decode(results?.keluaran),
            metode_pelaksanaan: decode(results?.metode_pelaksanaan),
            tahapan_kegiatan: decode(results?.tahapan_kegiatan),
            tempat_pelaksanaan: decode(results?.tempat_pelaksanaan),
            pelaksana_kegiatan: decode(results?.pelaksana_kegiatan),
            penanggung_jawab: decode(results?.penanggung_jawab),
            jadwal_kegiatan: decode(results?.jadwal_kegiatan),
            biaya: decode(results?.biaya),
         });
      }

      return () => {};
   }, [isLoading, results]);

   const onSubmit = () => {
      mutate(formData, {
         onSuccess: (response) => {
            const { status, errors, message } = response;
            setErrors(errors);

            if (status) {
               toast.success(message);
            } else {
               toast.error(message);
            }
         },
         onError: (error: Error) => {
            toast.error(`Gagal: ${error?.message}`);
         },
      });
   };

   if (isLoading || isLoadingJenisKeluaran || isLoadingPenerimaManfaat || isLoadingVolumeKeluaran) {
      return <TorSkeleton />;
   }

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Term of Reference (TOR)</CardTitle>
            <CardAction>
               <Button variant="outline" disabled={isPending} onClick={onSubmit} className="-mt-1">
                  {isPending && <Spinner />}Simpan TOR
               </Button>
            </CardAction>
         </CardHeader>
         <CardContent>
            <div className="row">
               <FormInput
                  divClassName="col-12 col-md-6"
                  label="Penyelenggara"
                  name="penyelenggara"
                  value={getValue(formData, "penyelenggara")}
                  onChange={(value) => setFormData({ ...formData, penyelenggara: value })}
                  errors={errors}
               />
               <FormInput
                  divClassName="col-12 col-md-6"
                  label="Program"
                  name="program"
                  value={getValue(formData, "program")}
                  onChange={(value) => setFormData({ ...formData, program: value })}
                  errors={errors}
               />
            </div>
            <div className="row">
               <FormInput
                  divClassName="col-12 col-md-6"
                  label="Kegiatan"
                  name="kegiatan"
                  value={getValue(formData, "kegiatan")}
                  onChange={(value) => setFormData({ ...formData, kegiatan: value })}
                  errors={errors}
               />
               <FormInput
                  divClassName="col-12 col-md-6"
                  label="Indikator Kinerja Kegiatan"
                  name="ikk"
                  value={getValue(formData, "ikk")}
                  onChange={(value) => setFormData({ ...formData, ikk: value })}
                  errors={errors}
               />
            </div>
            <div className="row">
               <FormMultiSelect
                  divClassName="col-12 col-md-4"
                  label="Jenis Keluaran (Output)"
                  name="jenis_keluaran"
                  value={getValueMulti(formData, "jenis_keluaran")} // Array string dari state
                  onChange={(selectedValues) => setFormData({ ...formData, jenis_keluaran: selectedValues })} // Update state dengan array baru
                  options={daftarJenisKeluaran.map((row: { nama: string; id: string }) => ({ label: row.nama, value: row.id }))}
                  errors={errors}
               />
               <FormMultiSelect
                  divClassName="col-12 col-md-4"
                  label="Volume Keluaran (Output)"
                  name="volume_keluaran"
                  value={getValueMulti(formData, "volume_keluaran")} // Array string dari state
                  onChange={(selectedValues) => setFormData({ ...formData, volume_keluaran: selectedValues })} // Update state dengan array baru
                  options={daftarVolumeKeluaran.map((row: { nama: string; id: string }) => ({ label: row.nama, value: row.id }))}
                  errors={errors}
               />
               <FormMultiSelect
                  divClassName="col-12 col-md-4"
                  label="Penerima Manfaat"
                  name="penerima_manfaat"
                  value={getValueMulti(formData, "penerima_manfaat")} // Array string dari state
                  onChange={(selectedValues) => setFormData({ ...formData, penerima_manfaat: selectedValues })} // Update state dengan array baru
                  options={daftarPenerimaManfaat.map((row: { nama: string; id: string }) => ({ label: row.nama, value: row.id }))}
                  errors={errors}
               />
            </div>
            <div className="row">
               <FormInput
                  divClassName="col-12 col-md-12"
                  label="Satuan Ukuran Keluaran"
                  name="satuan_ukuran_keluaran"
                  value={getValue(formData, "satuan_ukuran_keluaran")}
                  onChange={(value) => setFormData({ ...formData, satuan_ukuran_keluaran: value })}
                  errors={errors}
               />
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="dasar_hukum" className="mb-2">
                     Dasar Hukum
                  </Label>
                  <BundledEditor
                     id="dasar_hukum"
                     value={getValue(formData, "dasar_hukum")}
                     onEditorChange={(value) => setFormData({ ...formData, dasar_hukum: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="gambaran_umum" className="mb-2">
                     Gambaran Umum
                  </Label>
                  <BundledEditor
                     id="gambaran_umum"
                     value={getValue(formData, "gambaran_umum")}
                     onEditorChange={(value) => setFormData({ ...formData, gambaran_umum: value })}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="alasan_kegiatan" className="mb-2">
                     Alasan Kegiatan Dilaksanakan
                  </Label>
                  <BundledEditor
                     id="alasan_kegiatan"
                     value={getValue(formData, "alasan_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, alasan_kegiatan: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="uraian_kegiatan" className="mb-2">
                     Uraian Kegiatan
                  </Label>
                  <BundledEditor
                     id="uraian_kegiatan"
                     value={getValue(formData, "uraian_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, uraian_kegiatan: value })}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="batasan_kegiatan" className="mb-2">
                     Batasan Kegiatan
                  </Label>
                  <BundledEditor
                     id="batasan_kegiatan"
                     value={getValue(formData, "batasan_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, batasan_kegiatan: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="maksud_kegiatan" className="mb-2">
                     Maksud Kegiatan
                  </Label>
                  <BundledEditor
                     id="maksud_kegiatan"
                     value={getValue(formData, "maksud_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, maksud_kegiatan: value })}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="tujuan_kegiatan" className="mb-2">
                     Tujuan Kegiatan
                  </Label>
                  <BundledEditor
                     id="tujuan_kegiatan"
                     value={getValue(formData, "tujuan_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, tujuan_kegiatan: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="indikator_keluaran" className="mb-2">
                     Indikator Keluaran
                  </Label>
                  <BundledEditor
                     id="indikator_keluaran"
                     value={getValue(formData, "indikator_keluaran")}
                     onEditorChange={(value) => setFormData({ ...formData, indikator_keluaran: value })}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="keluaran" className="mb-2">
                     Keluaran
                  </Label>
                  <BundledEditor
                     id="keluaran"
                     value={getValue(formData, "keluaran")}
                     onEditorChange={(value) => setFormData({ ...formData, keluaran: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="metode_pelaksanaan" className="mb-2">
                     Metode Pelaksanaan
                  </Label>
                  <BundledEditor
                     id="metode_pelaksanaan"
                     value={getValue(formData, "metode_pelaksanaan")}
                     onEditorChange={(value) => setFormData({ ...formData, metode_pelaksanaan: value })}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="tahapan_kegiatan" className="mb-2">
                     Tahapan Kegiatan
                  </Label>
                  <BundledEditor
                     id="tahapan_kegiatan"
                     value={getValue(formData, "tahapan_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, tahapan_kegiatan: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="tempat_pelaksanaan" className="mb-2">
                     Tempat Pelaksanaan Kegiatan
                  </Label>
                  <BundledEditor
                     id="tempat_pelaksanaan"
                     value={getValue(formData, "tempat_pelaksanaan")}
                     onEditorChange={(value) => setFormData({ ...formData, tempat_pelaksanaan: value })}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="pelaksana_kegiatan" className="mb-2">
                     Pelaksana Kegiatan
                  </Label>
                  <BundledEditor
                     id="pelaksana_kegiatan"
                     value={getValue(formData, "pelaksana_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, pelaksana_kegiatan: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="penanggung_jawab" className="mb-2">
                     Penanggung Jawab Kegiatan
                  </Label>
                  <BundledEditor
                     id="penanggung_jawab"
                     value={getValue(formData, "penanggung_jawab")}
                     onEditorChange={(value) => setFormData({ ...formData, penanggung_jawab: value })}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <Label htmlFor="jadwal_kegiatan" className="mb-2">
                     Jadwal Kegiatan
                  </Label>
                  <BundledEditor
                     id="jadwal_kegiatan"
                     value={getValue(formData, "jadwal_kegiatan")}
                     onEditorChange={(value) => setFormData({ ...formData, jadwal_kegiatan: value })}
                  />
               </div>
               <div className="col-12 col-md-6">
                  <Label htmlFor="biaya" className="mb-2">
                     Biaya
                  </Label>
                  <BundledEditor
                     id="biaya"
                     value={getValue(formData, "biaya")}
                     onEditorChange={(value) => setFormData({ ...formData, biaya: value })}
                  />
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
