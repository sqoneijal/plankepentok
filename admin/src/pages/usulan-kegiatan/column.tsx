import ConfirmDelete from "@/components/confirm-delete";
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

const getStatusStyles = (status: string) => {
   switch (status) {
      case "draft":
      case "perbaiki":
         return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "pengajuan":
         return "bg-blue-500 text-white hover:bg-blue-600";
      case "diterima":
         return "bg-green-500 text-white hover:bg-green-600";
      case "ditolak":
         return "bg-red-500 text-white hover:bg-red-600";
      default:
         return "bg-gray-500 text-white hover:bg-gray-600";
   }
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "kode",
      header: "kode",
   },
   {
      key: "jenis_usulan.nama",
      header: "jenis usulan",
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
         let label;

         switch (status) {
            case "draft":
               label = "Draft";
               break;
            case "perbaiki":
               label = "Perbaiki";
               break;
            case "pengajuan":
               label = "Pengajuan";
               break;
            case "diterima":
               label = "Diterima";
               break;
            case "ditolak":
               label = "Ditolak";
               break;
            default:
               label = status;
         }

         return (
            <Badge variant="outline" className={getStatusStyles(status)}>
               {label}
            </Badge>
         );
      },
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         return (
            <>
               <LinkButton label={<Eye />} url={`${endpoint}/${original.id}`} type="edit" />
               {["", "draft", "perbaiki", "ditolak"].includes(original?.status_usulan as string) && (
                  <LinkButton label={<SquarePen />} url={`${endpoint}/actions/${original.id}`} type="edit" />
               )}
               {["", "draft", "perbaiki", "ditolak"].includes(original?.status_usulan as string) && (
                  <ConfirmDelete url={endpoint} id={original.id as string | number} />
               )}
            </>
         );
      },
      meta: { className: "w-[110px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
      })
   ),
];
