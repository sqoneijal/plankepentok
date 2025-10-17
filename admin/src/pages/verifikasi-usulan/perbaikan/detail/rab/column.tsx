import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getValue, toRupiah } from "@/helpers/init";
import { cn } from "@/lib/utils";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";

export const getColumns = (): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: "",
      enableSorting: true,
      cell: ({ row: { original } }) => {
         const status = getValue(original, "approve");
         let variant: "default" | "secondary" | "destructive" | undefined = undefined;
         let className = "";
         let label = status;
         switch (status) {
            case "valid":
               className = "bg-green-600 text-white hover:bg-green-700";
               label = "Valid";
               break;
            case "tidak_valid":
               variant = "destructive";
               label = "Tidak Valid";
               break;
            case "perbaiki":
               variant = "secondary";
               label = "Perbaiki";
               break;
         }
         return (
            <Badge variant={variant} className={cn(className, "h-5 rounded-full px-1 tabular-nums text-[10px]")}>
               {label}
            </Badge>
         );
      },
      meta: { className: "w-[100px]" },
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
];
