import ConfirmDialog from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Eye, SquarePen } from "lucide-react";
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
      cell: (value: unknown) => {
         const status = value as string;
         let variant: "default" | "secondary" | "destructive" | "outline";
         let label;

         switch (status) {
            case "draft":
               variant = "secondary";
               label = "Draft";
               break;
            case "pengajuan":
               variant = "outline";
               label = "Pengajuan";
               break;
            case "diterima":
               variant = "default";
               label = "Diterima";
               break;
            case "ditolak":
               variant = "destructive";
               label = "Ditolak";
               break;
            default:
               variant = "secondary";
               label = status;
         }

         return <Badge variant={variant}>{label}</Badge>;
      },
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => (
         <>
            <LinkButton label={<Eye />} url={`${endpoint}/${original.id}`} type="edit" />
            <LinkButton label={<SquarePen />} url={`${endpoint}/actions/${original.id}`} type="edit" />
            <ConfirmDialog url={endpoint} id={original.id as string | number} refetchKey={[[endpoint]]} />
         </>
      ),
      meta: { className: "w-[110px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
      })
   ),
];
