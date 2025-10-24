import { toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type CellContext, type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import moment from "moment";
import React from "react";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (info: CellContext<RowData, unknown>) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "kode",
      header: "kode",
   },
   {
      key: "nama",
      header: "nama usulan",
   },
   {
      key: "waktu_mulai",
      header: "waktu mulai",
      cell: (info) => {
         const value = info.getValue();
         return moment(value as string).format("DD-MM-YYYY");
      },
   },
   {
      key: "waktu_selesai",
      header: "waktu selesai",
      cell: (info) => {
         const value = info.getValue();
         return moment(value as string).format("DD-MM-YYYY");
      },
   },
   {
      key: "rencana_total_anggaran",
      header: "rencana anggaran",
      cell: (info) => {
         const value = info.getValue();
         return toRupiah(value);
      },
   },
   {
      key: "",
      header: "anggaran",
      cell: (info) => {
         const row = info.row.original;
         const rabDetail = row.rab_detail || [];
         const total = (rabDetail as Array<Record<string, unknown>>).reduce((sum: number, item: Record<string, unknown>) => {
            const perubahan = item.rab_detail_perubahan as Record<string, unknown> | undefined;
            return (
               sum +
               (perubahan ? Number.parseFloat((perubahan.total_biaya as string) || "0") : Number.parseFloat((item.total_biaya as string) || "0"))
            );
         }, 0);

         return `${toRupiah(row.total_anggaran)} -> ${toRupiah(total)}`;
      },
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         return <LinkButton label={<Eye />} url={`${endpoint}/${original.id}`} type="edit" />;
      },
      meta: { className: "w-[10px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ?? ((info) => info.getValue()),
      })
   ),
];
