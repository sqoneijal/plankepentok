import ConfirmDialog from "@/components/confirm-delete";
import { toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";
import moment from "moment";
import React from "react";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
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
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
   {
      key: "waktu_selesai",
      header: "waktu selesai",
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
   {
      key: "rencana_total_anggaran",
      header: "rencana anggaran",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "total_anggaran",
      header: "anggaran",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "status_usulan",
      header: "status",
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<SquarePen />} url={`/usulan-kegiatan/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={`/usulan-kegiatan`} id={original.id as string | number} refetchKey={[["/usulan-kegiatan"]]} />
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
