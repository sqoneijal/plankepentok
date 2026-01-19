import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { detailLabel, toRupiah } from "@/helpers/init";
import type { FormData } from "@/types/init";
import { getActiveUnit } from "../column";

export default function UsulanKegiatan({ results }: Readonly<{ results: FormData }>) {
   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("id-ID");
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Detail Usulan Kegiatan</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="row">
               <div className="col-12 col-md-2">{detailLabel({ label: "Kode", value: results.kode })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Nama", value: results.nama })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Waktu Mulai", value: formatDate(results.waktu_mulai) })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Waktu Selesai", value: formatDate(results.waktu_selesai) })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Operator Input", value: results.pengguna.fullname })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Tanggal Submit", value: formatDate(results.tanggal_submit) })}</div>
            </div>
            <div className="row">
               <div className="col-12 col-md-2">
                  {detailLabel({ label: "Rencana Total Anggaran", value: toRupiah(results.rencana_total_anggaran) })}
               </div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Total Anggaran", value: toRupiah(results.total_anggaran) })}</div>
               <div className="col-12 col-md-2">
                  {detailLabel({
                     label: "Total Anggaran Disetujui",
                     value: toRupiah(results.anggaran_disetujui.jumlah || 0),
                  })}
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-5">{detailLabel({ label: "Unit Pengusul", value: getActiveUnit(results.unit_pengusul) })}</div>
               <div className="col-12 col-md-5">{detailLabel({ label: "Tempat Pelaksanaan", value: results.tempat_pelaksanaan })}</div>
            </div>
            <div className="row">
               <div className="col-12">{detailLabel({ label: "Latar Belakang", value: results.latar_belakang })}</div>
            </div>
            <div className="row">
               <div className="col-12">{detailLabel({ label: "Tujuan", value: results.tujuan })}</div>
            </div>
            <div className="row">
               <div className="col-12">{detailLabel({ label: "Sasaran", value: results.sasaran })}</div>
            </div>
         </CardContent>
      </Card>
   );
}
