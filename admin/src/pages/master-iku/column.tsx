import ConfirmDialog from "@/components/confirm-delete";
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
      key: "jenis",
      header: "jenis",
      cell: (value: unknown) => {
         let displayValue = value as string;
         if (displayValue === "rektor") displayValue = "Rektor";
         if (displayValue === "perguruan_tinggi") displayValue = "Perguruan Tinggi";
         return displayValue;
      },
   },
   {
      key: "tahun_berlaku",
      header: "tahun",
   },
   {
      key: "kode",
      header: "kode",
   },
   {
      key: "deskripsi",
      header: "deskripsi",
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<SquarePen />} url={`/master-iku/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={`/master-iku`} id={original.id as string | number} refetchKey={[["/master-iku"]]} />
         </>
      ),
      meta: { className: "w-[80px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => String(info.getValue()),
      })
   ),
];
