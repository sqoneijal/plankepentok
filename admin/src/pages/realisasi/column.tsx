import ConfirmDialog from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { getValue, toRupiah } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { type NavigateFunction } from "react-router";

type ColumnDeps = { navigate: NavigateFunction; limit: number; offset: number };

const getColumns = ({ navigate, limit, offset }: ColumnDeps): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: "",
      cell: ({ row: { original } }) => {
         return (
            <>
               <Button variant="ghost" onClick={() => navigate(`/pagu-anggaran/fakultas/actions/${getValue(original, "id")}`)}>
                  <Pencil />
               </Button>
               <ConfirmDialog
                  url={`/pagu-anggaran/fakultas/actions/${getValue(original, "id")}`}
                  refetchKey={["pagu-anggaran", "fakultas", limit, offset]}
               />
            </>
         );
      },
      meta: { className: "text-start w-[100px]" },
   },
   {
      accessorKey: "fakultas",
      header: "fakultas",
      enableSorting: true,
   },
   {
      accessorKey: "tahun",
      header: "tahun",
      enableSorting: true,
   },
   {
      accessorKey: "pagu_unit",
      header: "jumlah pagu",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "pagu_unit")),
   },
   {
      accessorKey: "realisasi",
      header: "realisasi",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "realisasi")),
   },
   {
      accessorKey: "sisa",
      header: "sisa",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "sisa")),
   },
];

export { getColumns };
export type { ColumnDeps };
