import { Checkbox } from "@/components/ui/checkbox";
import { getStatusValidasiSesuai, getValue } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";

const jenis_iku: { [key: string]: string } = {
   rektor: "Rektor",
   perguruan_tinggi: "Perguruan Tinggi",
};

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
   {
      accessorKey: "status",
      header: "status",
      enableSorting: true,
      cell: ({ row: { original } }) => getStatusValidasiSesuai(getValue(original, "approve")),
      meta: { className: "w-[20px] text-center" },
   },
];
