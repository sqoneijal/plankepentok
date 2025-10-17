import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusValidasiRAB, getValue, toRupiah } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";

export const getColumns = (
   selectedRows?: Set<string>,
   onSelectRow?: (id: string) => void,
   onSelectAll?: () => void,
   totalRows?: number
): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: () => <Checkbox checked={selectedRows?.size === totalRows && (totalRows ?? 0) > 0} onCheckedChange={onSelectAll} />,
      enableSorting: true,
      cell: ({ row: { original } }) => {
         const id = getValue(original, "id");
         return <Checkbox checked={selectedRows?.has(id)} onCheckedChange={() => onSelectRow?.(id)} />;
      },
      meta: { className: "w-[20px] text-center" },
   },
   {
      accessorKey: "uraian_biaya",
      header: "uraian",
      enableSorting: true,
   },
   {
      accessorKey: "qty",
      header: "qty",
      enableSorting: true,
   },
   {
      accessorKey: "id_satuan",
      header: "satuan",
      enableSorting: true,
      cell: ({ row: { original } }: { row: { original: Lists } }) => (
         <Tooltip>
            <TooltipTrigger>{getValue(original, "nama_satuan")}</TooltipTrigger>
            <TooltipContent>{getValue(original, "deskripsi_satuan")}</TooltipContent>
         </Tooltip>
      ),
   },
   {
      accessorKey: "harga_satuan",
      header: "harga",
      enableSorting: true,
      cell: ({ row: { original } }: { row: { original: Lists } }) => toRupiah(getValue(original, "harga_satuan")),
   },
   {
      accessorKey: "total_biaya",
      header: "total biaya",
      enableSorting: true,
      cell: ({ row: { original } }: { row: { original: Lists } }) => toRupiah(getValue(original, "total_biaya")),
   },
   {
      accessorKey: "catatan",
      header: "catatan",
      enableSorting: true,
   },
   {
      accessorKey: "status",
      header: "status",
      enableSorting: true,
      cell: ({ row: { original } }) => getStatusValidasiRAB(getValue(original, "approve")),
      meta: { className: "w-[20px] text-center" },
   },
];
