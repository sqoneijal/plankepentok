import ConfirmDialog from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
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
      header: "Nama",
   },
   {
      key: "deskripsi",
      header: "Deskripsi",
   },
   {
      key: "aktif",
      header: "Status",
      cell: (value: unknown) => <Badge variant="outline">{value ? "Aktif" : "Tidak Aktif"}</Badge>,
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<SquarePen />} url={`/referensi/unit-satuan/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={`/referensi/unit-satuan`} id={original.id as string | number} refetchKey={[["/referensi/unit-satuan"]]} />
         </>
      ),
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
      })
   ),
];
