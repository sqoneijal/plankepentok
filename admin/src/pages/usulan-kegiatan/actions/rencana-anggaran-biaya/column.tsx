import ConfirmDialog from "@/components/confirm-delete";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";

type RowData = Record<string, unknown>;

type IkuData = {
   kode?: string;
   jenis?: string;
   deskripsi?: string;
   tahun_berlaku?: string;
};

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "uraian_biaya",
      header: "uraian biaya",
   },
   {
      key: "qty",
      header: "qty",
   },
   {
      key: "harga_satuan",
      header: "harga satuan",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "total_biaya",
      header: "total biaya",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "unit_satuan",
      header: "satuan",
      cell: (value: unknown) => (
         <Tooltip>
            <TooltipTrigger>{(value as { nama: string }).nama}</TooltipTrigger>
            <TooltipContent>{(value as { deskripsi: string }).deskripsi}</TooltipContent>
         </Tooltip>
      ),
   },
   {
      key: "catatan",
      header: "catatan",
   },
];

export const getColumns = (id_usulan_kegiatan?: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         const status_usulan = (original?.usulan_kegiatan as RowData)?.status_usulan as string;

         return (
            ["", "draft", "ditolak", "perbaiki"].includes(status_usulan) && (
               <>
                  <LinkButton label={<SquarePen />} url={`/usulan-kegiatan/actions/${id_usulan_kegiatan}/rab/${original.id}`} type="edit" />
                  <ConfirmDialog
                     url={`/usulan-kegiatan/rab`}
                     id={original.id as string | number}
                     refetchKey={[[`/usulan-kegiatan/${id_usulan_kegiatan}/rab`]]}
                  />
               </>
            )
         );
      },
      meta: { className: "w-[80px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue() as IkuData) : (info) => info.getValue(),
      })
   ),
];
