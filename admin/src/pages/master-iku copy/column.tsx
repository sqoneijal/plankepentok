import ConfirmDialog from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { getValue } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { NavigateFunction } from "react-router";

const jenis_iku: { [key: string]: string } = {
   rektor: "Rektor",
   perguruan_tinggi: "Perguruan Tinggi",
};

type ColumnDeps = { navigate: NavigateFunction; limit: number; offset: number };

const getColumns = ({ navigate, limit, offset }: ColumnDeps): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: "",
      cell: ({ row: { original } }) => {
         return (
            <>
               <Button variant="ghost" onClick={() => navigate(`/master-iku/actions/${getValue(original, "id")}`)}>
                  <Pencil />
               </Button>
               <ConfirmDialog url={`/master-iku/${getValue(original, "id")}`} refetchKey={[["master-iku", limit, offset]]} />
            </>
         );
      },
      meta: { className: "text-start w-[100px]" },
   },
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

export { getColumns };
