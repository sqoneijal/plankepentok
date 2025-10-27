import ConfirmDialog from "@/components/confirm-delete";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown, row?: RowData) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "nama",
      header: "Nama",
   },
   {
      key: "parent",
      header: "Parent",
      cell: (_value: unknown, row?: RowData) => {
         if (!row) return "";
         const level = row.level as string;
         const parent = row[`${level}_master`] as { nama?: string } | null;
         return parent?.nama || "";
      },
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<SquarePen />} url={`${endpoint}/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={endpoint} id={original.id as string | number} refetchKey={[[endpoint]]} />
         </>
      ),
      meta: { className: "w-[80px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue(), info.row.original) : (info) => info.getValue(),
      })
   ),
];
