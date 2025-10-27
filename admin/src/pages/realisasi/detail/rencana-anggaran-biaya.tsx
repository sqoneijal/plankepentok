import Table from "@/components/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { objectLength, toRupiah } from "@/helpers/init";
import type { ColumnDef } from "@tanstack/react-table";

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

const columns = (): Array<ColumnDef<RencanaAnggaranBiayaItem>> => [
   {
      accessorKey: "uraian_biaya",
      header: "Uraian Biaya",
   },
   {
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan) ? `${original?.qty} -> ${original?.rab_detail_perubahan?.qty}` : original?.qty,
   },
   {
      accessorKey: "unit_satuan",
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
      accessorKey: "harga_satuan",
      header: "Harga Satuan",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan)
            ? `${toRupiah(original?.harga_satuan)} -> ${toRupiah(original?.rab_detail_perubahan?.harga_satuan)}`
            : toRupiah(original?.harga_satuan),
   },
   {
      accessorKey: "total_biaya",
      header: "Total Biaya",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan)
            ? `${toRupiah(original?.total_biaya)} -> ${toRupiah(original?.rab_detail_perubahan?.total_biaya)}`
            : toRupiah(original?.total_biaya),
   },
   {
      accessorKey: "catatan",
      header: "Catatan",
   },
];

export default function RencanaAnggaranBiaya({ results, isLoading }: Readonly<{ results: Array<RencanaAnggaranBiayaItem>; isLoading: boolean }>) {
   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Rencana Anggaran Biaya</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns()} data={results} total={results.length} isLoading={isLoading} usePagination={false} />
         </CardContent>
      </Card>
   );
}
