import { DetailUsulanKegiatanSkeleton } from "@/components/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { detailLabel, objectLength, toRupiah } from "@/helpers/init";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { useEffect } from "react";
import type { Unit, UnitPengusul } from "../actions/init";

type Data = {
   unit_pengusul?: UnitPengusul;
};

const getActiveUnit = (data: Data): Unit | null => {
   const unit = data.unit_pengusul;
   if (!unit) return null;
   const keys = Object.keys(unit) as Array<keyof UnitPengusul>;

   for (const key of keys) {
      const value = unit[key];
      if (value != null) {
         return value;
      }
   }

   return null;
};

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
            <div className="row">
               <div className="col-12 col-md-2">{detailLabel({ label: "Kode Usulan", value: results?.kode })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Jenis Usulan", value: results?.jenis_usulan?.nama })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Rencana Anggaran", value: toRupiah(results?.rencana_total_anggaran) })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Total Anggaran", value: toRupiah(results?.total_anggaran) })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Tanggal Mulai", value: formatDate(results?.waktu_mulai) })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Tanggal Selesai", value: formatDate(results?.waktu_selesai) })}</div>
            </div>
            <div className="row">
               <div className="col-12 col-md-5">{detailLabel({ label: "Tempat Pelaksanaan", value: results?.tempat_pelaksanaan })}</div>
               <div className="col-12 col-md-5">{detailLabel({ label: "Unit Pengusul", value: getActiveUnit(results)?.nama })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Tanggal Pengajuan", value: formatDate(results?.tanggal_submit) })}</div>
            </div>
            <div className="row">
               <div className="col-12 col-md-2">{detailLabel({ label: "Operator Pengusul", value: results?.pengguna?.fullname })}</div>
               <div className="col-12 col-md-2">
                  {detailLabel({
                     label: "Status Usulan",
                     value: <Badge className={getStatusStyles(results.status_usulan)}>{formatStatus(results.status_usulan)}</Badge>,
                  })}
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-4">{detailLabel({ label: "Latar Belakang", value: results?.latar_belakang })}</div>
               <div className="col-12 col-md-4">{detailLabel({ label: "Tujuan", value: results?.tujuan })}</div>
               <div className="col-12 col-md-4">{detailLabel({ label: "Sasaran", value: results?.sasaran })}</div>
            </div>
         </CardContent>
      </Card>
   );
}
