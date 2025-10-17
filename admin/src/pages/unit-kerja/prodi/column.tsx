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
   {
      key: "fakultas",
      header: "fakultas",
      cell: (value: unknown) => (value as { nama?: string })?.nama || "-",
   },
   {
      key: "fakultas",
      header: "biro",
      cell: (value: unknown) => (value as { biro?: { nama?: string } })?.biro?.nama || "-",
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<SquarePen />} url={`/unit-kerja/program-studi/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={`/unit-kerja/prodi`} id={original.id as string | number} refetchKey={[["/unit-kerja/prodi"]]} />
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
