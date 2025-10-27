import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { objectLength, toRupiah } from "@/helpers/init";
import type { ColumnDef } from "@tanstack/react-table";
import type { RencanaAnggaranBiayaItem, UnitSatuan } from "../detail/rencana-anggaran-biaya";

export const columns = (): Array<ColumnDef<RencanaAnggaranBiayaItem>> => [
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
];
