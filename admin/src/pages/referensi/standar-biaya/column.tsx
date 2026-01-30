import ConfirmDialog from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "kode",
      header: "Kode",
   },
   {
      key: "nama",
      header: "Nama",
   },
   {
      key: "deskripsi",
      header: "Deskripsi",
   },
   {
      key: "kategori_sbm",
      header: "Kategori",
      cell: (value: unknown) => (
         <Tooltip>
            <TooltipTrigger className="text-start">
               <Badge variant="outline" className="mr-2">
                  {(value as { kode: string })?.kode}
               </Badge>
               {(value as { nama: string })?.nama}
            </TooltipTrigger>
            <TooltipContent>{(value as { deskripsi: string })?.deskripsi}</TooltipContent>
         </Tooltip>
      ),
   },
   {
      key: "unit_satuan",
      header: "Unit Satuan",
      cell: (value: unknown) => (
         <Tooltip>
            <TooltipTrigger className="text-start">{(value as { nama: string }).nama}</TooltipTrigger>
            <TooltipContent>{(value as { deskripsi: string }).deskripsi}</TooltipContent>
         </Tooltip>
      ),
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<SquarePen />} url={`${endpoint}/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={endpoint} id={original.id as string | number} />
         </>
      ),
      meta: { className: "w-[80px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
      }),
   ),
];
