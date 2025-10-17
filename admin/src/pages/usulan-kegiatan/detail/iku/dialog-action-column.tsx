import { getValue } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { jenis_iku } from "./helpers";

export const getColumnsDialog = (): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "jenis",
      header: "jenis",
      enableSorting: true,
      cell: ({ row: { original } }) => jenis_iku?.[getValue(original, "jenis")],
   },
   {
      accessorKey: "kode",
      header: "kode",
      enableSorting: true,
   },
   {
      accessorKey: "deskripsi",
      header: "deskripsi",
      enableSorting: true,
   },
   {
      accessorKey: "tahun_berlaku",
      header: "tahun",
      enableSorting: true,
   },
];
