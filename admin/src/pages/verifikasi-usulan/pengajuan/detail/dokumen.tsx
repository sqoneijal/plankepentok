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
   if (approve === "sesuai") return "Approved";
   if (approve === "tidak_sesuai") return "Rejected";
   return "Draft";
};

const columns = ({
   setOpenDialog,
   setFormData,
}: {
   setOpenDialog: (open: boolean) => void;
   setFormData: (data: FormData) => void;
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
      accessorKey: "approve",
      header: "status",
      cell: ({ getValue }) => <Badge className={getApproveBadgeClass(getValue()?.toString())}>{getApproveStatus(getValue() as string | null)}</Badge>,
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
      accessorKey: "catatan_perbaikan",
      header: "catatan perbaikan",
   },
];

export default function Dokumen({
   results,
   isLoading,
   endpoint,
   id_usulan,
}: Readonly<{ results: Array<DokumenItem>; isLoading: boolean; endpoint: string; id_usulan: string }>) {
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
            id_usulan={id_usulan}
         />
         <Card className="mt-4">
            <CardHeader>
               <CardTitle>Dokumen Pendukung</CardTitle>
            </CardHeader>
            <CardContent>
               <Table
                  columns={columns({ setOpenDialog, setFormData })}
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
   id_usulan,
}: Readonly<{
   formData: FormData;
   setFormData: (data: FormData) => void;
   errors: FormData;
   setErrors: (data: FormData) => void;
   openDialog: boolean;
   setOpenDialog: (open: boolean) => void;
   endpoint: string;
   id_usulan: string;
}>) {
   const submit = usePutMutation<FormData, unknown>(`${endpoint}/dokumen/${formData?.id}`, (data) => ({ ...data }), [[`${endpoint}/${id_usulan}`]]);

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
