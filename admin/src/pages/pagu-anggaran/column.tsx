import { Badge } from "@/components/ui/badge";
import { toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "tahun_anggaran",
      header: "tahun anggaran",
   },
   {
      key: "total_pagu",
      header: "total pagu",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "realisasi",
      header: "realisasi",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "is_aktif",
      header: "status",
      cell: (value: unknown) => <Badge variant="outline">{value ? "Aktif" : "Tidak Aktif"}</Badge>,
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => <LinkButton label={<Eye />} url={`${endpoint}/${original.id}`} type="edit" />,
      meta: { className: "w-[10px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
      })
   ),
];
