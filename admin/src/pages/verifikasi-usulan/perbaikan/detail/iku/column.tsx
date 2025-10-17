import { getValue } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";

const jenis_iku: { [key: string]: string } = {
   rektor: "Rektor",
   perguruan_tinggi: "Perguruan Tinggi",
};

export const getColumns = (): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "jenis_iku",
      header: "jenis",
      enableSorting: true,
      cell: ({ row: { original } }) => jenis_iku?.[getValue(original, "jenis_iku")],
   },
   {
      accessorKey: "kode_iku",
      header: "kode",
      enableSorting: true,
   },
   {
      accessorKey: "deskripsi_iku",
      header: "deskripsi",
      enableSorting: true,
   },
   {
      accessorKey: "tahun_berlaku_iku",
      header: "tahun",
      enableSorting: true,
   },
];
