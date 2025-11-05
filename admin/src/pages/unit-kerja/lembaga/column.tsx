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
      key: "nama",
      header: "nama",
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
      })
   ),
];
