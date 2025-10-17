import ConfirmDialog from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { getStatusAktifNonAktif, getValue, toRupiah } from "@/helpers/init";
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
               <Button variant="ghost" onClick={() => navigate(`/pengaturan/actions/${getValue(original, "id")}`)}>
                  <Pencil />
               </Button>
               <ConfirmDialog url={`/pengaturan/actions/${getValue(original, "id")}`} refetchKey={["pengaturan", limit, offset]} />
            </>
         );
      },
      meta: { className: "text-start w-[100px]" },
   },
   {
      accessorKey: "tahun_anggaran",
      header: "tahun anggaran",
      enableSorting: true,
   },
   {
      accessorKey: "total_pagu",
      header: "total pagu",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "total_pagu")),
   },
   {
      accessorKey: "realisasi",
      header: "realisasi",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "realisasi")),
   },
   {
      accessorKey: "is_aktif",
      header: "status",
      enableSorting: true,
      cell: ({ row: { original } }) => getStatusAktifNonAktif(getValue(original, "is_aktif")),
      meta: { className: "text-center w-[100px]" },
   },
];

export { getColumns };
export type { ColumnDeps };
