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
import { useState } from "react";
import { toast } from "sonner";

interface IkuMaster {
   id: number;
   jenis: string;
   kode: string;
   deskripsi: string;
   tahun_berlaku: string;
   uploaded: string | null;
   modified: string | null;
   user_modified: string | null;
}

interface IkuItem {
   id: number;
   id_usulan: number;
   id_iku: number;
   uploaded: string;
   user_modified: string;
   approve: string | null;
   modified: string | null;
   iku_master: IkuMaster;
}

const getApproveStatus = (approve: string | null) => {
   if (approve === null) return "Draft";
   if (approve === "sesuai") return "Approved";
   if (approve === "tidak_sesuai") return "Rejected";
   return "Draft";
};

const getApproveBadgeClass = (approve: string | null) => {
   if (approve === null) return "bg-yellow-500 text-white hover:bg-yellow-600";
   if (approve === "sesuai") return "bg-green-500 text-white hover:bg-green-600";
   return "bg-red-500 text-white hover:bg-red-600";
};

const formatJenis = (jenis: string) => {
   return jenis
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const ApproveCell: React.FC<{ approve: string | null }> = ({ approve = null }) => (
   <Badge className={getApproveBadgeClass(approve)}>{getApproveStatus(approve)}</Badge>
);

const ApproveTableCell = ({ getValue }: { getValue: () => unknown }) => <ApproveCell approve={getValue() as string | null} />;

const DeskripsiCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const DeskripsiTableCell = ({ getValue }: { getValue: () => unknown }) => <DeskripsiCell value={getValue() as string} />;

const JenisCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const JenisTableCell = ({ getValue }: { getValue: () => unknown }) => <JenisCell value={getValue() as string} />;

const columns = ({
   setOpenDialog,
   setFormData,
}: {
   setOpenDialog: (status: boolean) => void;
   setFormData: (data: FormData) => void;
}): Array<ColumnDef<IkuItem>> => [
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
      header: "Status",
      cell: ApproveTableCell,
      meta: { className: "w-[10px]" },
   },
   {
      accessorKey: "iku_master.kode",
      header: "Kode",
   },
   {
      accessorKey: "iku_master.jenis",
      header: "Jenis",
      cell: JenisTableCell,
   },
   {
      accessorKey: "iku_master.tahun_berlaku",
      header: "Tahun Berlaku",
   },
   {
      accessorKey: "iku_master.deskripsi",
      header: "Deskripsi",
      cell: DeskripsiTableCell,
   },
   {
      accessorKey: "catatan_perbaikan",
      header: "Catatan Perbaikan",
   },
];

function DialogIku({
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
   const submit = usePutMutation<FormData, unknown>(`${endpoint}/iku/${formData?.id}`, (data) => ({ ...data }), [[`${endpoint}/${id_usulan}`]]);

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

export default function Iku({
   results,
   isLoading,
   endpoint,
   id_usulan,
}: Readonly<{ results: Array<IkuItem>; isLoading: boolean; endpoint: string; id_usulan: string }>) {
   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});
   const [openDialog, setOpenDialog] = useState(false);

   return (
      <>
         <DialogIku
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
               <CardTitle>IKU</CardTitle>
            </CardHeader>
            <CardContent>
               <Table
                  columns={columns({ setOpenDialog, setFormData })}
                  data={results}
                  isLoading={isLoading}
                  usePagination={false}
                  total={results.length}
               />
            </CardContent>
         </Card>
      </>
   );
}
