import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { usePutMutation } from "@/hooks/usePutMutation";
import { FormSelect, FormTextarea } from "@/lib/helpers";
import type { FormData } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { PackageCheck } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface VerifikasiItem {
   id_referensi: number;
   table_referensi: string;
   status: string | null;
   catatan?: string;
}

interface DokumenItem {
   id: number;
   id_usulan: number;
   nama_dokumen: string;
   tipe_dokumen: string;
   path_file: string;
   uploaded: string;
   modified: string | null;
   user_modified: string;
   file_dokumen: string;
   approve: string | null;
}

const AksiCell: React.FC<{ value: string }> = ({ value }) => (
   <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      Lihat Dokumen
   </a>
);

const AksiTableCell = ({ getValue }: { getValue: () => unknown }) => <AksiCell value={getValue() as string} />;

const getApproveBadgeClass = (approve: string | null | undefined) => {
   if (approve === null || approve === undefined) return "bg-yellow-500 text-white hover:bg-yellow-600";
   if (approve === "sesuai") return "bg-green-500 text-white hover:bg-green-600";
   return "bg-red-500 text-white hover:bg-red-600";
};

const getApproveStatus = (approve: string | null) => {
   if (approve === null) return "Draft";
   if (approve === "sesuai") return "Sesuai";
   if (approve === "tidak_sesuai") return "Tidak Sesuai";
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
}): Array<ColumnDef<DokumenItem>> => [
   {
      accessorKey: "id",
      header: "",
      cell: ({ getValue }) => (
         <Button
            className="size-6"
            variant="outline"
            onClick={() => {
               setOpenDialog(true);
               setFormData({ id: String(getValue()) });
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
         const value = verifikasi.find(
            (e: { id_referensi: number; table_referensi: string }) => e.id_referensi === getValue() && e.table_referensi === "tb_dokumen_pendukung"
         );

         return <Badge className={getApproveBadgeClass(value?.status)}>{getApproveStatus(value?.status as string)}</Badge>;
      },
      meta: { className: "w-[10px]" },
   },
   {
      accessorKey: "nama_dokumen",
      header: "Nama Dokumen",
   },
   {
      accessorKey: "tipe_dokumen",
      header: "Tipe Dokumen",
   },
   {
      accessorKey: "file_dokumen",
      header: "File",
   },
   {
      accessorKey: "path_file",
      header: "Aksi",
      cell: AksiTableCell,
   },
   {
      accessorKey: "id",
      header: "Catatan Perbaikan",
      cell: ({ getValue }) => {
         const value = verifikasi.find(
            (e: { id_referensi: number; table_referensi: string }) => e.id_referensi === getValue() && e.table_referensi === "tb_dokumen_pendukung"
         );
         if (value && value?.status === "tidak_sesuai") return value?.catatan;
      },
   },
];

export default function Dokumen({
   results,
   isLoading,
   endpoint,
   verifikasi,
   klaim_verifikasi,
}: Readonly<{
   results: Array<DokumenItem>;
   isLoading: boolean;
   endpoint: string;
   verifikasi: Array<VerifikasiItem>;
   klaim_verifikasi: Record<string, string>;
}>) {
   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});
   const [openDialog, setOpenDialog] = useState(false);

   return (
      <>
         <DialogActions
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            endpoint={endpoint}
            klaim_verifikasi={klaim_verifikasi}
         />
         <Card className="mt-4">
            <CardHeader>
               <CardTitle>Dokumen Pendukung</CardTitle>
            </CardHeader>
            <CardContent>
               <Table
                  columns={columns({ setOpenDialog, setFormData, verifikasi })}
                  data={results || []}
                  isLoading={isLoading}
                  usePagination={false}
                  total={results.length}
               />
            </CardContent>
         </Card>
      </>
   );
}

function DialogActions({
   formData,
   setFormData,
   errors,
   setErrors,
   openDialog,
   setOpenDialog,
   endpoint,
   klaim_verifikasi,
}: Readonly<{
   formData: FormData;
   setFormData: (data: FormData) => void;
   errors: FormData;
   setErrors: (data: FormData) => void;
   openDialog: boolean;
   setOpenDialog: (open: boolean) => void;
   endpoint: string;
   klaim_verifikasi: Record<string, string>;
}>) {
   const submit = usePutMutation<FormData, unknown>(`${endpoint}/dokumen/${formData?.id}`, (data) => ({ ...data, klaim_verifikasi }));

   return (
      <Dialog open={openDialog}>
         <DialogContent showCloseButton={false}>
            <DialogHeader>
               <DialogTitle>Konfirmasi Validasi IKU?</DialogTitle>
               <DialogDescription className="text-xs">
                  Apakah IKU ini sesuai dengan kriteria validasi? Pilih 'Sesuai' untuk menyetujui validasi atau 'Tidak Sesuai' untuk menolak.
               </DialogDescription>
            </DialogHeader>
            <div className="row">
               <FormSelect
                  divClassName="col-12"
                  label="Status"
                  name="approve"
                  options={[
                     { value: "sesuai", label: "Sesuai" },
                     { value: "tidak_sesuai", label: "Tidak Sesuai" },
                  ]}
                  value={formData?.approve}
                  onChange={(value) => setFormData({ ...formData, approve: value })}
                  errors={errors}
               />
               {formData?.approve === "tidak_sesuai" && (
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

                              if (status) {
                                 setOpenDialog(false);
                                 toast.success(message);
                              } else {
                                 setErrors(errors);
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
