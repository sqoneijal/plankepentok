import ConfirmDialog from "@/components/confirm-submit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toRupiah } from "@/helpers/init";
import { usePostMutation } from "@/hooks/usePostMutation";
import { FormTextarea } from "@/lib/helpers";
import type { ApiResponse } from "@/types/init";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export type Unit = {
   id: number;
   nama: string;
};

export type UnitPengusul = {
   biro_master?: Unit | null;
   fakultas_master?: Unit | null;
   lembaga_master?: Unit | null;
   sub_unit?: Unit | null;
   upt_master?: Unit | null;
};

export type DetailUsulan = {
   kode: string;
   jenis_usulan: { nama: string };
   waktu_mulai: string;
   waktu_selesai: string;
   pengguna: { fullname: string };
   total_anggaran: number;
   status_usulan: string;
   tanggal_submit: string;
   rencana_total_anggaran: number;
   unit_pengusul: UnitPengusul;
   tempat_pelaksanaan: string;
   latar_belakang: string;
   tujuan: string;
   sasaran: string;
   catatan_perbaikan: string | null;
   klaim_verifikasi: Record<string, string>;
};

const getActiveUnit = (unit_pengusul: UnitPengusul) => {
   if (!unit_pengusul) return null;
   const keys = Object.keys(unit_pengusul) as Array<keyof UnitPengusul>;

   let unit;

   for (const key of keys) {
      const value: Unit | null | undefined = unit_pengusul[key];
      if (value != null) {
         unit = value?.nama;
      }
   }

   return unit;
};

const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleDateString("id-ID");
};

const getStatusStyles = (status: string) => {
   switch (status) {
      case "draft":
      case "perbaiki":
         return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "pengajuan":
         return "bg-blue-500 text-white hover:bg-blue-600";
      case "diterima":
         return "bg-green-500 text-white hover:bg-green-600";
      case "ditolak":
         return "bg-red-500 text-white hover:bg-red-600";
      default:
         return "bg-gray-500 text-white hover:bg-gray-600";
   }
};

const formatStatus = (status: string) => {
   return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function UsulanKegiatan({ results, endpoint, id_usulan }: Readonly<{ results: DetailUsulan; endpoint: string; id_usulan: string }>) {
   const [dialogType, setDialogType] = useState<"reject" | "improve" | null>(null);
   const [alasan, setAlasan] = useState("");
   const [errors, setErrors] = useState({});

   const navigate = useNavigate();

   const tolakMutation = usePostMutation(`${endpoint}/${id_usulan}/tolak`, undefined, [
      [`${endpoint}/${id_usulan}`],
      [`${endpoint}/${id_usulan}/histori-penolakan`],
   ]);

   const perbaikiMutation = usePostMutation(`${endpoint}/${id_usulan}/perbaiki`, undefined, [
      [`${endpoint}/${id_usulan}`],
      [`${endpoint}/${id_usulan}/histori-perbaikan`],
   ]);

   const handleAction = (mutation: ReturnType<typeof usePostMutation>) => {
      mutation.mutate(
         {
            ...results?.klaim_verifikasi,
            catatan: alasan,
         },
         {
            onSuccess: (response: ApiResponse) => {
               const { errors, status, message } = response;
               setErrors(errors || {});

               if (status) {
                  toast.success(message);
                  setDialogType(null);
                  setAlasan("");
                  return;
               }

               toast.error(message);
            },
         }
      );
   };

   const handleTolak = () => {
      handleAction(tolakMutation);
   };

   const handlePerbaiki = () => {
      handleAction(perbaikiMutation);
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Detail Usulan Kegiatan</CardTitle>
            <CardAction>
               <ButtonGroup className="-mt-2">
                  <ConfirmDialog
                     url={`${endpoint}/setujui`}
                     refetchKey={[`${endpoint}/${id_usulan}`]}
                     formData={{ id_usulan, ...results?.klaim_verifikasi }}
                     actionButton={
                        <Button variant="outline" className="bg-green-300 font-bold">
                           Setujui
                        </Button>
                     }
                     message="Apakah Anda yakin ingin menyetujui usulan kegiatan ini?"
                     onSuccess={(status) => {
                        if (status) navigate(endpoint);
                     }}
                  />
                  <Button variant="outline" className="bg-yellow-300 font-bold" onClick={() => setDialogType("improve")}>
                     Perbaiki
                  </Button>
                  <Button variant="outline" className="bg-red-300 font-bold" onClick={() => setDialogType("reject")}>
                     Tolak
                  </Button>
               </ButtonGroup>
            </CardAction>
         </CardHeader>
         <CardContent>
            <div className="row">
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Kode</Label>
                  <p>{results.kode}</p>
               </div>
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Jenis Usulan</Label>
                  <p>{results.jenis_usulan.nama}</p>
               </div>
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Waktu Mulai</Label>
                  <p>{formatDate(results.waktu_mulai)}</p>
               </div>
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Waktu Selesai</Label>
                  <p>{formatDate(results.waktu_selesai)}</p>
               </div>
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Operator Input</Label>
                  <p>{results.pengguna.fullname}</p>
               </div>
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Total Anggaran</Label>
                  <p>{toRupiah(results.total_anggaran)}</p>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Status Usulan</Label>
                  <p>
                     <Badge className={getStatusStyles(results.status_usulan)}>{formatStatus(results.status_usulan)}</Badge>
                  </p>
               </div>
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Tanggal Submit</Label>
                  <p>{formatDate(results.tanggal_submit)}</p>
               </div>
               <div className="col-12 col-md-2">
                  <Label className="font-semibold">Rencana Total Anggaran</Label>
                  <p>{toRupiah(results.rencana_total_anggaran)}</p>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-5">
                  <Label className="font-semibold">Unit Pengusul</Label>
                  <p>{getActiveUnit(results.unit_pengusul)}</p>
               </div>
               <div className="col-12 col-md-5">
                  <Label className="font-semibold">Tempat Pelaksanaan</Label>
                  <p>{results.tempat_pelaksanaan}</p>
               </div>
            </div>
            <div className="row">
               <div className="col-12">
                  <Label className="font-semibold">Latar Belakang</Label>
                  <p className="text-sm leading-relaxed">{results.latar_belakang}</p>
               </div>
            </div>
            <div className="row">
               <div className="col-12">
                  <Label className="font-semibold">Tujuan</Label>
                  <p className="text-sm leading-relaxed">{results.tujuan}</p>
               </div>
            </div>
            <div className="row">
               <div className="col-12">
                  <Label className="font-semibold">Sasaran</Label>
                  <p className="text-sm leading-relaxed">{results.sasaran}</p>
               </div>
            </div>
            <div className="row">
               <div className="col-12">
                  <Label className="font-semibold">Catatan</Label>
                  <p>{results.catatan_perbaikan || "N/A"}</p>
               </div>
            </div>
         </CardContent>
         {dialogType && (
            <Dialog open={!!dialogType} onOpenChange={(open) => !open && setDialogType(null)}>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>{dialogType === "reject" ? "Konfirmasi Penolakan" : "Konfirmasi Perbaikan"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 row">
                     <FormTextarea
                        divClassName="col-12"
                        label={dialogType === "reject" ? "Alasan Penolakan" : "Alasan Perbaikan"}
                        name="catatan"
                        value={alasan}
                        onChange={(value) => setAlasan(value)}
                        errors={errors}
                     />
                  </div>
                  <DialogFooter>
                     <Button variant="outline" onClick={() => setDialogType(null)}>
                        Batal
                     </Button>
                     <Button
                        variant="destructive"
                        onClick={dialogType === "reject" ? handleTolak : handlePerbaiki}
                        disabled={dialogType === "reject" ? tolakMutation.isPending : perbaikiMutation.isPending}>
                        {(dialogType === "reject" ? tolakMutation.isPending : perbaikiMutation.isPending) && <Spinner />}
                        {dialogType === "reject" ? "Tolak" : "Perbaiki"}
                     </Button>
                  </DialogFooter>
               </DialogContent>
            </Dialog>
         )}
      </Card>
   );
}
