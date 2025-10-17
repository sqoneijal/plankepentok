import { FormSelect, FormText, FormTextarea } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { btn_loading, formatRupiah, getValue, toNumber, toRupiah } from "@/helpers/init";
import { useDataEdit, useDialog, useTablePagination } from "@/hooks/store";
import { queryClient } from "@/lib/queryClient";
import { useApiQuery, usePostMutation } from "@/lib/useApi";
import type { Lists, Option } from "@/types/init";
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { loadingElement } from "../helper";

const DialogReferensiHargaSBM = lazy(() => import("./dialog-referensi-harga-sbm"));

function DialogAction() {
   const { open, setOpen } = useDialog();
   const { id_usulan_kegiatan } = useParams();
   const { pagination } = useTablePagination();
   const { dataEdit, setDataEdit } = useDataEdit();

   const [formData, setFormData] = useState<Lists>({});
   const [errors, setErrors] = useState<Lists>({});
   const [openReferensiSBM, setOpenReferensiSBM] = useState(false);

   useEffect(() => {
      if (Object.keys(dataEdit).length > 0) {
         setFormData(dataEdit);
      }
      return () => {};
   }, [dataEdit]);

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const submit = usePostMutation<{ errors: Lists }>(`/usulan-kegiatan/${id_usulan_kegiatan}/rab/actions`);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      submit.mutate(
         {
            ...formData,
            harga_satuan: getValue(formData, "harga_satuan").toString().replace(/\./g, ""),
         },
         {
            onSuccess: (data) => {
               setErrors(data?.errors ?? {});
               if (data?.status) {
                  setFormData({});
                  setDataEdit({});
                  setOpen(false);
                  queryClient.refetchQueries({ queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "rab", limit, offset] });
                  queryClient.refetchQueries({ queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "anggaran"] });
                  queryClient.refetchQueries({ queryKey: ["usulan-kegiatan", limit, offset] });
                  toast.success(data?.message);
                  return;
               }

               toast.error(data?.message);
            },
            onError: (error: Error) => {
               toast.error(error.message);
            },
         }
      );
   };

   const { data, isLoading, error } = useApiQuery<{ daftarUnitSatuan: Array<Option> }>({
      queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "rab", "actions"],
      url: `/usulan-kegiatan/${id_usulan_kegiatan}/rab/actions`,
   });

   const handleRowClick = (row: Lists) => {
      setFormData((prev) => ({
         ...prev,
         total_biaya: (1 * toNumber(getValue(row, "harga_satuan").toString().replace(/\./g, ""))).toString(),
         harga_satuan: formatRupiah(getValue(row, "harga_satuan")),
         id_satuan: getValue(row, "id_satuan"),
         uraian_biaya: getValue(row, "nama_standar_biaya"),
      }));
      setOpenReferensiSBM(false);
   };

   if (isLoading) return loadingElement;

   if (error) return toast.error(error?.message);

   return (
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
         <DialogContent className="w-auto min-h-0 sm:max-w-none">
            <DialogHeader>
               <DialogTitle>RAB</DialogTitle>
               <DialogDescription>
                  RAB (Rencana Anggaran Biaya) adalah perincian rencana biaya yang dibutuhkan untuk suatu kegiatan atau proyek, digunakan sebagai
                  acuan pengajuan dan pengendalian anggaran.
               </DialogDescription>
            </DialogHeader>
            <ScrollArea className="w-full max-h-[calc(100vh-200px)] min-h-0">
               <Suspense fallback={loadingElement}>
                  <DialogReferensiHargaSBM open={openReferensiSBM} setOpen={() => setOpenReferensiSBM(false)} onRowClick={handleRowClick} />
               </Suspense>
               <div className="space-y-4">
                  <div className="row">
                     <div className="col-12 col-md-3">
                        <FormText
                           type="number"
                           label="Qty"
                           name="qty"
                           value={getValue(formData, "qty")}
                           onChange={(value) =>
                              setFormData((prev) => ({
                                 ...prev,
                                 qty: value,
                                 total_biaya: (
                                    toNumber(value) * toNumber(getValue(formData, "harga_satuan").toString().replace(/\./g, ""))
                                 ).toString(),
                              }))
                           }
                           errors={errors}
                        />
                     </div>
                     <div className="col-12 col-md-3">
                        <FormSelect
                           label="Satuan"
                           name="id_satuan"
                           value={getValue(formData, "id_satuan")}
                           onValueChange={(value) => setFormData((prev) => ({ ...prev, id_satuan: value }))}
                           errors={errors}
                           options={(data?.data?.daftarUnitSatuan as Array<Lists>).map((item) => ({
                              value: item.id,
                              label: item.nama,
                              tooltip: item.deskripsi,
                           }))}
                        />
                     </div>
                     <div className="col-12 col-md-6">
                        <FormText
                           label="Harga Satuan"
                           name="harga_satuan"
                           value={getValue(formData, "harga_satuan")}
                           onChange={(value) => {
                              const formatted = formatRupiah(value);
                              setFormData((prev) => ({
                                 ...prev,
                                 harga_satuan: formatted,
                                 total_biaya: (toNumber(getValue(formData, "qty")) * toNumber(value.toString().replace(/\./g, ""))).toString(),
                              }));
                           }}
                           errors={errors}
                        />
                     </div>
                  </div>
                  <div className="row">
                     <div className="col-12 col-md-6">
                        <FormText
                           label="Total Biaya"
                           name="total_biaya"
                           value={toRupiah(getValue(formData, "total_biaya"))}
                           errors={errors}
                           disabled={true}
                        />
                     </div>
                  </div>
                  <div className="row">
                     <div className="col-12 col-md-6 mb-3">
                        <FormTextarea
                           label="Uraian Biaya"
                           name="uraian_biaya"
                           value={getValue(formData, "uraian_biaya")}
                           onChange={(value) => setFormData((prev) => ({ ...prev, uraian_biaya: value }))}
                           errors={errors}
                        />
                     </div>
                     <div className="col-12 col-md-6 mb-3">
                        <FormTextarea
                           label="Catatan"
                           name="catatan"
                           value={getValue(formData, "catatan")}
                           onChange={(value) => setFormData((prev) => ({ ...prev, catatan: value }))}
                           errors={errors}
                        />
                     </div>
                  </div>
                  <Button size="sm" disabled={submit.isPending} onClick={handleSubmit}>
                     {submit.isPending ? btn_loading() : "Simpan"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setOpenReferensiSBM(true)} className="float-end">
                     Referensi Harga SBM
                  </Button>
               </div>
            </ScrollArea>
         </DialogContent>
      </Dialog>
   );
}

export default DialogAction;
