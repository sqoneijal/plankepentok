import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toRupiah } from "@/helpers/init";
import { usePegawai, useUnitKerja } from "@/helpers/simpeg";
import type { FormData } from "@/types/init";

export default function UsulanKegiatan({ results }: Readonly<{ results: FormData }>) {
   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("id-ID");
   };

   const getStatusStyles = (status: string) => {
      switch (status) {
         case "draft":
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

   const { data: unitPengusul, isLoading: isLoadingUnitPengusul } = useUnitKerja(results.id_unit_pengusul);
   const { data: operatorInput, isLoading: isLoadingOperatorInput } = usePegawai(results.operator_input);

   return (
      <Card>
         <CardHeader>
            <CardTitle>Detail Usulan Kegiatan</CardTitle>
            <CardAction>
               <ButtonGroup className="-mt-2">
                  <Button variant="outline" className="bg-green-300 font-bold">
                     Setujui
                  </Button>
                  <Button variant="outline" className="bg-yellow-300 font-bold">
                     Perbaiki
                  </Button>
                  <Button variant="outline" className="bg-red-300 font-bold">
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
                  <Label className="font-semibold">Nama</Label>
                  <p>{results.nama}</p>
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
                  <p>{isLoadingOperatorInput ? <Spinner /> : operatorInput?.nama || "N/A"}</p>
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
                  <p>{isLoadingUnitPengusul ? <Spinner /> : unitPengusul}</p>
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
                  <Label className="font-semibold">Catatan Perbaikan</Label>
                  <p>{results.catatan_perbaikan || "N/A"}</p>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
