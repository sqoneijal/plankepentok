import ConfirmDialog from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { createColumnHelper, type CellContext, type ColumnDef } from "@tanstack/react-table";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (info: CellContext<RowData, unknown>) => React.ReactNode;
};

const status = (text: string) => {
   const config: Record<string, string> = {
      true: "Aktif",
      false: "Tidak Aktif",
   };
   return config[text];
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "jenis_usulan.nama",
      header: "jenis usulan",
   },
   {
      key: "tahap",
      header: "tahap",
   },
   {
      key: "pengguna.fullname",
      header: "verifikator",
   },
   {
      key: "jenis_usulan.is_aktif",
      header: "Status",
      cell: (info) => <Badge variant="outline">{status(String(info.getValue()))}</Badge>,
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => <ConfirmDialog url={endpoint} id={original.id as string | number} />,
      meta: { className: "w-[10px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ?? ((info) => info.getValue()),
      })
   ),
];
