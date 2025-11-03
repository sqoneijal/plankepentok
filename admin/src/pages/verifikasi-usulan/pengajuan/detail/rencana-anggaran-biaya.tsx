import { DialogValidasiSkeleton } from "@/components/loading-skeleton";
import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cleanRupiah, detailLabel, objectLength, toNumber, toRupiah } from "@/helpers/init";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePutMutation } from "@/hooks/usePutMutation";
import { FormInput, FormSelect, FormTextarea } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import type { FormData } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { PackageCheck } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";

type ApproveStatus = "valid" | "tidak_valid" | "perbaiki" | null;

interface VerifikasiItem {
   id_referensi: string;
   table_referensi: string;
   status: ApproveStatus;
   catatan: string;
}

interface UnitSatuan {
   id: number;
   nama: string;
   deskripsi: string;
   aktif: boolean;
   uploaded: string | null;
   modified: string | null;
   user_modified: string | null;
}

interface RabDetailPerubahan {
   harga_satuan: string;
   id: number;
   qty: string;
   total_biaya: string;
}

interface RencanaAnggaranBiayaItem {
   id: number;
   id_usulan: number;
   uraian_biaya: string;
   qty: string;
   id_satuan: number;
   harga_satuan: string;
   total_biaya: string;
   catatan: string | null;
   uploaded: string;
   modified: string | null;
   user_modified: string;
   approve: ApproveStatus;
   unit_satuan: UnitSatuan;
   catatan_perbaikan: string | null;
   rab_detail_perubahan: RabDetailPerubahan;
}

interface ReferensiSbmItem {
   id: number;
   harga_satuan: string;
   tanggal_mulai_efektif: string;
   tanggal_akhir_efektif: string;
   standar_biaya_master: {
      kode: string;
      nama: string;
   };
   unit_satuan: {
      nama: string;
      deskripsi: string;
   };
}

const getBadgeClass = (approve: ApproveStatus) => {
   if (approve === "valid") return "bg-green-400";
   if (approve === "tidak_valid") return "bg-red-400";
   return "bg-orange-400";
};

const getBadgeText = (approve: ApproveStatus) => {
   if (approve === "valid") return "Valid";
   if (approve === "tidak_valid") return "Tidak Valid";
   if (approve === "perbaiki") return "Perbaiki";
   return "Draft";
};

const columns = ({
   setOpenDialog,
   setFormData,
   verifikasi,
}: {
   setOpenDialog: (open: boolean) => void;
   setFormData: (data: FormData) => void;
   verifikasi: Array<VerifikasiItem>;
}): Array<ColumnDef<RencanaAnggaranBiayaItem>> => [
   {
      accessorKey: "*",
      header: "",
      cell: ({ row: { original } }) => (
         <Button
            className="size-6"
            variant="outline"
            onClick={() => {
               const rab_detail_perubahan = original?.rab_detail_perubahan;

               setOpenDialog(true);
               setFormData({
                  ...Object.fromEntries(Object.entries(original).map(([k, v]) => [k, k === "unit_satuan" ? v : v?.toString() ?? ""])),
                  new_qty: objectLength(rab_detail_perubahan) ? rab_detail_perubahan?.qty : original.qty,
                  new_harga_satuan: objectLength(rab_detail_perubahan) ? rab_detail_perubahan?.harga_satuan : original.harga_satuan,
                  new_total_biaya: objectLength(rab_detail_perubahan) ? rab_detail_perubahan?.total_biaya : original.total_biaya,
               });
            }}>
            <PackageCheck />
         </Button>
      ),
      meta: { className: "w-[10px]" },
   },
   {
      accessorKey: "id",
      header: "Status",
      cell: ({ getValue }) => {
         const value = verifikasi.find((e: VerifikasiItem) => e.id_referensi === getValue() && e.table_referensi === "tb_rab_detail");
         const approve = value?.status as ApproveStatus;

         return <Badge className={getBadgeClass(approve)}>{getBadgeText(approve)}</Badge>;
      },
      meta: { className: "w-[10px]" },
   },
   {
      accessorKey: "uraian_biaya",
      header: "Uraian Biaya",
      meta: { className: "w-[300px]" },
   },
   {
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan) ? `${original?.qty} -> ${original?.rab_detail_perubahan?.qty}` : original?.qty,
   },
   {
      accessorKey: "unit_satuan",
      header: "Satuan",
      cell: (value) => {
         const unitSatuan = value.getValue() as UnitSatuan;
         return (
            <Tooltip>
               <TooltipTrigger>{unitSatuan?.nama}</TooltipTrigger>
               <TooltipContent>{unitSatuan?.deskripsi}</TooltipContent>
            </Tooltip>
         );
      },
   },
   {
      accessorKey: "harga_satuan",
      header: "Harga Satuan",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan)
            ? `${toRupiah(original?.harga_satuan)} -> ${toRupiah(original?.rab_detail_perubahan?.harga_satuan)}`
            : toRupiah(original?.harga_satuan),
   },
   {
      accessorKey: "total_biaya",
      header: "Total Biaya",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan)
            ? `${toRupiah(original?.total_biaya)} -> ${toRupiah(original?.rab_detail_perubahan?.total_biaya)}`
            : toRupiah(original?.total_biaya),
   },
   {
      accessorKey: "catatan",
      header: "Catatan",
   },
   {
      accessorKey: "id",
      header: "Catatan Perbaikan",
      cell: ({ getValue }) => {
         const value = verifikasi.find((e: VerifikasiItem) => e.id_referensi === getValue() && e.table_referensi === "tb_rab_detail");
         const approve = value?.status as ApproveStatus;

         if (approve !== "valid") {
            return value?.catatan;
         }
      },
   },
];

function getSelectedRef(array: Array<ReferensiSbmItem>, value: string) {
   return array?.find((e) => e.id.toString() === value);
}

function DialogValidasi({
   formData,
   setFormData,
   errors,
   setErrors,
   openDialog,
   setOpenDialog,
   endpoint,
   id_usulan,
   id_jenis_usulan,
}: Readonly<{
   formData: FormData;
   setFormData: (data: FormData) => void;
   errors: FormData;
   setErrors: (data: FormData) => void;
   openDialog: boolean;
   setOpenDialog: (open: boolean) => void;
   endpoint: string;
   id_usulan: string;
   id_jenis_usulan: string;
}>) {
   const [selectedReferensi, setSelectedReferensi] = useState<ReferensiSbmItem>();

   const submit = usePutMutation<FormData, unknown>(`${endpoint}/rab/${formData?.id}`, (data) => ({
      ...data,
      id_usulan_kegiatan: id_usulan,
      id_jenis_usulan,
   }));

   const { data, isLoading } = useApiQuery({
      url: `${endpoint}/referensi-sbm`,
   });

   if (isLoading) {
      return <DialogValidasiSkeleton />;
   }

   return (
      <Dialog open={openDialog}>
         <DialogContent showCloseButton={false} className={cn(formData?.approve === "ubah" && "sm:max-w-none w-[80%]")}>
            <DialogHeader>
               <DialogTitle>Konfirmasi Validasi Rencana Anggaran Biaya?</DialogTitle>
               <DialogDescription className="text-xs">
                  Apakah item rencana anggaran biaya ini sesuai dengan kriteria validasi? Pilih 'Valid' untuk menyetujui, 'Perbaiki' untuk meminta
                  perbaikan, atau 'Tidak Valid' untuk menolak.
               </DialogDescription>
            </DialogHeader>
            <div className="row">
               <div className={cn("col-12", formData?.approve === "ubah" && "col-md-6")}>
                  <div className="row">
                     <div className="col-12">{detailLabel({ label: "Uraian Biaya", value: formData?.uraian_biaya })}</div>
                     <div className="col-12 col-md-6">{detailLabel({ label: "Qty", value: formData?.qty })}</div>
                     <div className="col-12 col-md-6">
                        {detailLabel({ label: "Satuan", value: (formData?.unit_satuan as unknown as UnitSatuan)?.nama })}
                     </div>
                     <div className="col-12 col-md-6">{detailLabel({ label: "Harga Satuan", value: toRupiah(formData?.harga_satuan) })}</div>
                     <div className="col-12 col-md-6">{detailLabel({ label: "Total Biaya", value: toRupiah(formData?.total_biaya) })}</div>
                  </div>
                  <div className="row">
                     <FormSelect
                        divClassName={cn("col-12", formData?.approve === "ubah" && "col-md-6")}
                        label="Status"
                        name="approve"
                        options={[
                           { value: "valid", label: "Valid" },
                           { value: "perbaiki", label: "Perbaiki" },
                           { value: "tidak_valid", label: "Tidak Valid" },
                           { value: "ubah", label: "Ubah Nilai" },
                        ]}
                        value={formData?.approve}
                        onChange={(value) => setFormData({ ...formData, approve: value })}
                        errors={errors}
                     />
                     {["ubah"].includes(formData?.approve) && (
                        <>
                           <FormInput
                              apakahFormatRupiah={true}
                              divClassName={cn("col-12", formData?.approve === "ubah" ? "col-md-6" : "mt-4")}
                              label="Harga Satuan"
                              name="new_harga_satuan"
                              value={formData?.new_harga_satuan}
                              onChange={(value) => {
                                 setFormData({
                                    ...formData,
                                    new_harga_satuan: value,
                                    new_total_biaya: (toNumber(formData?.new_qty) * cleanRupiah(value)).toString(),
                                 });
                              }}
                              errors={errors}
                           />
                           <FormInput
                              apakahFormatRupiah={true}
                              divClassName={cn("col-12 mt-4", formData?.approve === "ubah" && "col-md-6")}
                              type="number"
                              label="QTY"
                              name="new_qty"
                              value={formData?.new_qty}
                              onChange={(value) =>
                                 setFormData({
                                    ...formData,
                                    new_qty: value,
                                    new_total_biaya: (toNumber(value) * cleanRupiah(formData?.new_harga_satuan)).toString(),
                                 })
                              }
                              errors={errors}
                           />
                           <FormInput
                              apakahFormatRupiah={true}
                              divClassName={cn("col-12 mt-4", formData?.approve === "ubah" && "col-md-6")}
                              label="Total Biaya"
                              value={formData?.new_total_biaya}
                              disabled={true}
                              errors={errors}
                           />
                        </>
                     )}
                     {["perbaiki", "tidak_valid", "ubah"].includes(formData?.approve) && (
                        <FormTextarea
                           divClassName="col-12 mt-4"
                           label="Catatan perbaikan"
                           name="catatan_perbaikan"
                           value={formData?.catatan_perbaikan}
                           onChange={(value) => setFormData({ ...formData, catatan_perbaikan: value })}
                           errors={errors}
                        />
                     )}
                  </div>
               </div>
               {formData?.approve === "ubah" && (
                  <div className="col-12 col-md-6">
                     <div className="row">
                        <FormSelect
                           divClassName="col-12"
                           useCommand={true}
                           label="Referensi SBM"
                           name="ref_sbm"
                           options={data?.results?.map((row: ReferensiSbmItem) => ({
                              value: String(row?.id),
                              label: `${row?.standar_biaya_master?.kode} - ${row?.standar_biaya_master?.nama} - ${row?.unit_satuan?.nama}`,
                           }))}
                           onChange={(value) => {
                              const getData = getSelectedRef(data?.results, value);
                              setSelectedReferensi(getData);
                           }}
                           value={selectedReferensi?.id?.toString()}
                        />
                     </div>
                     {objectLength(selectedReferensi) && (
                        <div className="row">
                           <div className="col-12">
                              {detailLabel({
                                 label: "Standar Biaya",
                                 value: `${selectedReferensi?.standar_biaya_master?.kode} - ${selectedReferensi?.standar_biaya_master?.nama}`,
                              })}
                              {detailLabel({
                                 label: "Satuan",
                                 value: `${selectedReferensi?.unit_satuan?.nama} - ${selectedReferensi?.unit_satuan?.deskripsi}`,
                              })}
                              {detailLabel({ label: "Harga Satuan", value: toRupiah(selectedReferensi?.harga_satuan) })}
                              {detailLabel({
                                 label: "Efektif",
                                 value: `${moment(selectedReferensi?.tanggal_mulai_efektif).format("DD-MM-YYYY")} s.d ${moment(
                                    selectedReferensi?.tanggal_akhir_efektif
                                 ).format("DD-MM-YYYY")}`,
                              })}
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
            <DialogFooter>
               <Button className="h-7" variant="outline" onClick={() => setOpenDialog(false)}>
                  Batal
               </Button>
               <Button
                  className="h-7"
                  disabled={submit.isPending}
                  onClick={() =>
                     submit.mutate(
                        { ...formData },
                        {
                           onSuccess: (response) => {
                              const { status, errors, message } = response;
                              setErrors(errors);
                              if (status) {
                                 setOpenDialog(false);
                                 toast.success(message);
                              } else {
                                 toast.error(message);
                              }
                           },
                        }
                     )
                  }>
                  {submit.isPending && <Spinner />}Lanjutkan
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}

export default function RencanaAnggaranBiaya({
   results,
   isLoading,
   endpoint,
   id_usulan,
   anggaran_disetujui,
   id_jenis_usulan,
   verifikasi,
}: Readonly<{
   results: Array<RencanaAnggaranBiayaItem>;
   isLoading: boolean;
   endpoint: string;
   id_usulan: string;
   anggaran_disetujui: Record<string, string>;
   verifikasi: Array<VerifikasiItem>;
   id_jenis_usulan: string;
}>) {
   const totalBiaya = results.reduce((sum: number, item: RencanaAnggaranBiayaItem) => sum + Number.parseFloat(item.total_biaya || "0"), 0);

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});
   const [openDialog, setOpenDialog] = useState(false);

   return (
      <>
         <DialogValidasi
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            endpoint={endpoint}
            id_usulan={id_usulan}
            id_jenis_usulan={id_jenis_usulan}
         />
         <Card className="mt-4">
            <CardHeader>
               <CardTitle>Rencana Anggaran Biaya</CardTitle>
               <CardAction>
                  <div className="flex items-center justify-end gap-2 -mt-1">
                     <Badge variant="outline" className="bg-yellow-100">
                        <Label className="text-sm font-medium text-gray-600">Total Anggaran Pengajuan:</Label>
                        <div className="font-semibold text-lg">{toRupiah(totalBiaya)}</div>
                     </Badge>
                     <Badge variant="outline" className="bg-green-100">
                        <Label className="text-sm font-medium text-gray-600">Total Anggaran Disetujui:</Label>
                        <div className="font-semibold text-lg">{toRupiah(anggaran_disetujui.jumlah)}</div>
                     </Badge>
                  </div>
               </CardAction>
            </CardHeader>
            <CardContent>
               <Table
                  columns={columns({ setOpenDialog, setFormData, verifikasi })}
                  data={results}
                  total={results.length}
                  isLoading={isLoading}
                  usePagination={false}
               />
            </CardContent>
         </Card>
      </>
   );
}
