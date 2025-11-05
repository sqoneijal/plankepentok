import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toRupiah } from "@/helpers/init";

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
   jenis_usulan: { id: number; nama: string };
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
   klaim_verifikasi: {
      verikator_usulan: {
         id: number;
         tahap: string;
      };
      [key: string]: string | number | boolean | object;
   };
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

export default function UsulanKegiatan({ results }: Readonly<{ results: DetailUsulan }>) {
   return (
      <Card>
         <CardHeader>
            <CardTitle>Detail Usulan Kegiatan</CardTitle>
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
      </Card>
   );
}
