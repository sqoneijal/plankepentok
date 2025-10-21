import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusValidasiSesuai, getValue } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export const getColumns = (
   selectedRows?: Set<string>,
   onSelectRow?: (id: string) => void,
   onSelectAll?: () => void,
   totalRows?: number
): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "select",
      header: () => <Checkbox checked={selectedRows?.size === totalRows && (totalRows ?? 0) > 0} onCheckedChange={onSelectAll} />,
      enableSorting: true,
      cell: ({ row: { original } }) => {
         const id = getValue(original, "id");
         return <Checkbox checked={selectedRows?.has(id)} onCheckedChange={() => onSelectRow?.(id)} />;
      },
      meta: { className: "w-[20px] text-center" },
   },
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
   {
      accessorKey: "status",
      header: "status",
      enableSorting: true,
      cell: ({ row: { original } }) => getStatusValidasiSesuai(getValue(original, "approve")),
      meta: { className: "w-[20px] text-center" },
   },
];
