import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { objectLength, toRupiah } from "@/helpers/init";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";

type ApproveStatus = "valid" | "tidak_valid" | "perbaiki" | null;

export interface UnitSatuan {
   id: number;
   nama: string;
   deskripsi: string;
   aktif: boolean;
   uploaded: string | null;
   modified: string | null;
   user_modified: string | null;
}

export interface RabDetailPerubahan {
   harga_satuan: string;
   id: number;
   qty: string;
   total_biaya: string;
}

export interface RencanaAnggaranBiayaItem {
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

export interface RealisasiRencanaAnggaranBiayaItem {
   rab_detail: RencanaAnggaranBiayaItem;
   tanggal_mulai: string;
   tanggal_selesai: string;
   anggaran_digunakan: string;
   deskripsi: string;
}

const columns = (): Array<ColumnDef<RealisasiRencanaAnggaranBiayaItem>> => [
   {
      accessorKey: "rab_detail.uraian_biaya",
      header: "Uraian Biaya",
   },
   {
      accessorKey: "rab_detail",
      header: "Qty",
      cell: (value) => {
         const data = value.getValue() as RencanaAnggaranBiayaItem;
         return objectLength(data?.rab_detail_perubahan) ? data?.rab_detail_perubahan?.qty : data?.qty;
      },
   },
   {
      accessorKey: "rab_detail.unit_satuan",
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
      accessorKey: "tanggal_mulai",
      header: "Tanggal Mulai",
      cell: (value) => new Date(String(value.getValue())).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }),
   },
   {
      accessorKey: "tanggal_selesai",
      header: "Tanggal Selesai",
      cell: (value) => new Date(String(value.getValue())).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }),
   },
   {
      accessorKey: "anggaran_digunakan",
      header: "anggaran digunakan",
      cell: (value) => toRupiah(value.getValue()),
   },
   {
      accessorKey: "deskripsi",
      header: "deskripsi",
   },
];

export default function RencanaAnggaranBiaya({
   results,
   isLoading,
   endpoint,
   id,
}: Readonly<{
   results: Array<RealisasiRencanaAnggaranBiayaItem>;
   isLoading: boolean;
   endpoint: string;
   id: string;
}>) {
   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Realisasi Rencana Anggaran Biaya</CardTitle>
            <CardAction>
               <Button asChild variant="outline" className="-mt-2">
                  <Link to={`${endpoint}/${id}/actions`}>Tambah Realisasi</Link>
               </Button>
            </CardAction>
         </CardHeader>
         <CardContent>
            <Table columns={columns()} data={results} total={results.length} isLoading={isLoading} usePagination={false} />
         </CardContent>
      </Card>
   );
}
