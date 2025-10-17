import { Button } from "@/components/ui/button";
import { getValue } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

const getColumns = (): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: "",
      cell: ({ row: { original } }) => {
         return (
            <Button variant="ghost" onClick={() => window.open(getValue(original, "path_file"), "_blank")}>
               <Eye />
            </Button>
         );
      },
      meta: { className: "text-start w-[150px]" },
   },
   {
      accessorKey: "nama_dokumen",
      header: "nama dokumen",
      enableSorting: true,
   },
   {
      accessorKey: "tipe_dokumen",
      header: "tipe dokumen",
      enableSorting: true,
   },
   {
      accessorKey: "file_dokumen",
      header: "file dokumen",
      enableSorting: true,
   },
];

export { getColumns };
