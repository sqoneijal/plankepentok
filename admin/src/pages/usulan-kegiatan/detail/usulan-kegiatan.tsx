import { DetailUsulanKegiatanSkeleton } from "@/components/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { objectLength, toRupiah } from "@/helpers/init";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { useEffect } from "react";

export default function UsulanKegiatan({
   endpoint,
   id,
   setStatusUsulan,
}: Readonly<{ endpoint: string; id: string | undefined; setStatusUsulan: (value: string) => void }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, id);

   useEffect(() => {
      if (!isLoading && objectLength(results)) {
         setStatusUsulan(results?.status_usulan);
      }
      return () => {};
   }, [isLoading, results, setStatusUsulan]);

   if (isLoading) {
      return <DetailUsulanKegiatanSkeleton />;
   }

   if (!results) {
      return <div>Data tidak ditemukan</div>;
   }

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
      return status && status.charAt(0).toUpperCase() + status.slice(1);
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Detail Usulan Kegiatan</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <Label className="font-semibold">ID</Label>
                  <p>{results.id}</p>
               </div>
               <div>
                  <Label className="font-semibold">Kode</Label>
                  <p>{results.kode}</p>
               </div>
               <div className="md:col-span-3">
                  <Label className="font-semibold">Nama</Label>
                  <p>{results.nama}</p>
               </div>
               <div className="md:col-span-3">
                  <Label className="font-semibold">Latar Belakang</Label>
                  <p className="text-sm leading-relaxed">{results.latar_belakang}</p>
               </div>
               <div className="md:col-span-3">
                  <Label className="font-semibold">Tujuan</Label>
                  <p className="text-sm leading-relaxed">{results.tujuan}</p>
               </div>
               <div className="md:col-span-3">
                  <Label className="font-semibold">Sasaran</Label>
                  <p className="text-sm leading-relaxed">{results.sasaran}</p>
               </div>
               <div>
                  <Label className="font-semibold">Waktu Mulai</Label>
                  <p>{formatDate(results.waktu_mulai)}</p>
               </div>
               <div>
                  <Label className="font-semibold">Waktu Selesai</Label>
                  <p>{formatDate(results.waktu_selesai)}</p>
               </div>
               <div className="md:col-span-3">
                  <Label className="font-semibold">Tempat Pelaksanaan</Label>
                  <p>{results.tempat_pelaksanaan}</p>
               </div>
               <div>
                  <Label className="font-semibold">ID Unit Pengusul</Label>
                  <p>{results.id_unit_pengusul}</p>
               </div>
               <div>
                  <Label className="font-semibold">Operator Input</Label>
                  <p>{results.operator_input || "N/A"}</p>
               </div>
               <div>
                  <Label className="font-semibold">Total Anggaran</Label>
                  <p>{toRupiah(results.total_anggaran)}</p>
               </div>
               <div>
                  <Label className="font-semibold">Status Usulan</Label>
                  <p>
                     <Badge className={getStatusStyles(results.status_usulan)}>{formatStatus(results.status_usulan)}</Badge>
                  </p>
               </div>
               <div>
                  <Label className="font-semibold">Tanggal Submit</Label>
                  <p>{formatDate(results.tanggal_submit)}</p>
               </div>
               <div>
                  <Label className="font-semibold">Rencana Total Anggaran</Label>
                  <p>{toRupiah(results.rencana_total_anggaran)}</p>
               </div>
               <div className="md:col-span-3">
                  <Label className="font-semibold">Catatan Perbaikan</Label>
                  <p>{results.catatan_perbaikan || "N/A"}</p>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
