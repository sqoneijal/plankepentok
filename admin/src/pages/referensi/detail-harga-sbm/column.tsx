import ConfirmDialog from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type CellContext, type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";
import moment from "moment";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (info: CellContext<RowData, unknown>) => React.ReactNode;
};

const status = (text: string) => {
   const config: Record<string, string> = {
      valid: "Valid",
      draft: "Draft",
      kadaluarsa: "Kadaluarsa",
   };
   return config[text];
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "standar_biaya",
      header: "Standar Biaya",
      cell: (info) => `${(info.getValue() as { kode: string; nama: string }).kode} - ${(info.getValue() as { kode: string; nama: string }).nama}`,
   },
   {
      key: "tahun_anggaran",
      header: "tahun",
   },
   {
      key: "harga_satuan",
      header: "harga satuan",
      cell: (info) => toRupiah(info.getValue()),
   },
   {
      key: "unit_satuan",
      header: "satuan",
      cell: (info) => (
         <Tooltip>
            <TooltipTrigger>{(info.getValue() as { nama: string }).nama}</TooltipTrigger>
            <TooltipContent>{(info.getValue() as { deskripsi: string }).deskripsi}</TooltipContent>
         </Tooltip>
      ),
   },
   {
      key: "",
      header: "efektif",
      cell: (info) => (
         <>
            <Badge variant="outline">
               {moment((info.row.original as { tanggal_mulai_efektif: string }).tanggal_mulai_efektif).format("DD-MM-YYYY")}
            </Badge>
            <Badge variant="outline">
               {moment((info.row.original as { tanggal_akhir_efektif: string }).tanggal_akhir_efektif).format("DD-MM-YYYY")}
            </Badge>
         </>
      ),
   },
   {
      key: "status_validasi",
      header: "Status",
      cell: (info) => <Badge variant="outline">{status(info.getValue() as string)}</Badge>,
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<SquarePen />} url={`/referensi/detail-harga-sbm/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={`/referensi/detail-harga-sbm`} id={original.id as string | number} refetchKey={[["/referensi/detail-harga-sbm"]]} />
         </>
      ),
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ?? ((info) => info.getValue()),
      })
   ),
];
