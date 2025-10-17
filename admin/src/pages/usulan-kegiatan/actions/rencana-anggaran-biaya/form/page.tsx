import { FormRencanaAnggaranSkeleton, LoadingSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cleanRupiah, covertToSTring, getValue, toNumber, toRupiah } from "@/helpers/init";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/lib/helpers";
import { lazy, Suspense, useEffect, useState } from "react";
import { useCreateData, useGetDetailRab, useInitForms, useOptions, useUpdateData, type FormData } from "../init";

const ReferensiSBM = lazy(() => import("../referensi/page"));

export default function Page({
   id_usulan_kegiatan,
   handleSheetForm,
   id_rab_detail,
}: Readonly<{
   id_usulan_kegiatan?: string;
   id_rab_detail?: string;
   handleSheetForm: (status: boolean) => void;
}>) {
   console.log(id_rab_detail);
   const isEdit = !!id_rab_detail;

   const [openSheet, setOpenSheet] = useState(false);

   const { formData, setFormData, errors, setErrors } = useInitForms();
   const { unitSatuan, isLoading } = useOptions();
   const { dataDetail, isLoadingDetail } = useGetDetailRab(id_usulan_kegiatan, id_rab_detail);

   const createData = useCreateData({ id_usulan_kegiatan, formData, setErrors, handleSheetForm });
   const updateData = useUpdateData({ id_rab_detail, id_usulan_kegiatan, formData, setErrors, handleSheetForm });

   useEffect(() => {
      if (Object.keys(dataDetail).length > 0) {
         const converted = covertToSTring(dataDetail);
         setFormData(converted as FormData);
      }
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dataDetail]);

   const { onSubmit, isPending } = isEdit ? updateData : createData;

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      console.log(id_rab_detail);
      if (id_rab_detail) handleSheetForm(!!id_rab_detail);
   }, [id_rab_detail, handleSheetForm]);

   if (isLoading || isLoadingDetail) {
      return <FormRencanaAnggaranSkeleton />;
   }

   return (
      <ScrollArea className="h-screen">
         <form onSubmit={handleSubmit}>
            <div className="row">
               <FormInput
                  divClassName="col-12"
                  label="Uraian Biaya"
                  value={getValue(formData, "uraian_biaya")}
                  name="uraian_biaya"
                  onChange={(value) => setFormData({ ...formData, uraian_biaya: value })}
                  errors={errors}
               />
            </div>
            <div className="row">
               <FormSelect
                  divClassName="col-12"
                  label="Unit Satuan"
                  name="id_satuan"
                  options={unitSatuan.map((row: FormData) => ({ value: row.id.toString(), label: row.nama, tooltipContent: row.deskripsi }))}
                  onChange={(value) => setFormData({ ...formData, id_satuan: value })}
                  value={getValue(formData, "id_satuan")}
                  errors={errors}
               />
            </div>
            <div className="row">
               <FormInput
                  divClassName="col-12"
                  label="Harga Satuan"
                  value={getValue(formData, "harga_satuan")}
                  name="harga_satuan"
                  onChange={(value) =>
                     setFormData({
                        ...formData,
                        harga_satuan: value,
                        total_biaya: String((getValue(formData, "qty") ? toNumber(getValue(formData, "qty")) : 1) * toNumber(value)),
                     })
                  }
                  errors={errors}
                  apakahFormatRupiah={true}
               />
            </div>
            <div className="row">
               <FormInput
                  type="number"
                  divClassName="col-12"
                  label="Jumlah"
                  value={getValue(formData, "qty")}
                  name="qty"
                  onChange={(value) =>
                     setFormData({
                        ...formData,
                        qty: value,
                        total_biaya: String(toNumber(value) * toNumber(cleanRupiah(getValue(formData, "harga_satuan")))),
                     })
                  }
                  errors={errors}
                  disabled={!getValue(formData, "harga_satuan")}
               />
            </div>
            <div className="row">
               <FormInput
                  divClassName="col-12"
                  label="Total Biaya"
                  value={toRupiah(getValue(formData, "total_biaya"))}
                  name="total_biaya"
                  disabled={true}
                  errors={errors}
               />
            </div>
            <div className="row">
               <FormTextarea
                  divClassName="col-12"
                  label="Catatan"
                  value={getValue(formData, "catatan")}
                  name="catatan"
                  onChange={(value) => setFormData({ ...formData, catatan: value })}
                  errors={errors}
               />
            </div>
            <div className="row">
               <div className="col-6">
                  <SubmitButton label={isEdit ? "Perbaharui" : "Simpan"} isLoading={isPending} />
               </div>
               <div className="col-6">
                  <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                     <SheetTrigger asChild>
                        <Button variant="outline" className="float-end">
                           Referensi SBM
                        </Button>
                     </SheetTrigger>
                     <SheetContent side="left" className="w-[75%] sm:max-w-none">
                        <SheetHeader className="-mb-8">
                           <SheetTitle>Daftar Referensi SBM</SheetTitle>
                           <SheetDescription>
                              Berikut adalah daftar referensi Standar Biaya Masukan (SBM) yang dapat digunakan sebagai panduan dalam menyusun rencana
                              anggaran biaya kegiatan.
                           </SheetDescription>
                        </SheetHeader>
                        <Suspense fallback={<LoadingSkeleton />}>
                           <div className="p-4">
                              <ReferensiSBM setOpenSheet={setOpenSheet} formData={formData} setFormData={setFormData} />
                           </div>
                        </Suspense>
                     </SheetContent>
                  </Sheet>
               </div>
            </div>
         </form>
      </ScrollArea>
   );
}
