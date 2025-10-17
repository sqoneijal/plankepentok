import { Button } from "@/components/ui/button";
import { getValue, toRupiah } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import moment from "moment";
import type { NavigateFunction } from "react-router";

type ColumnDeps = {
   navigate: NavigateFunction;
};

const getColumns = ({ navigate }: ColumnDeps): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: "",
      cell: ({ row: { original } }) => {
         return (
            <Button variant="ghost" onClick={() => navigate(`/verifikasi-usulan/pengajuan/${getValue(original, "id")}#informasi-dasar`)}>
               <Eye />
            </Button>
         );
      },
      meta: { className: "text-start w-[20px]" },
   },
   {
      accessorKey: "kode",
      header: "kode",
      enableSorting: true,
   },
   {
      accessorKey: "nama",
      header: "nama",
      enableSorting: true,
   },
   {
      accessorKey: "waktu",
      header: "waktu",
      enableSorting: true,
      cell: ({ row: { original } }) =>
         `${moment(getValue(original, "waktu_mulai")).format("DD-MM-YYYY")} s.d ${moment(getValue(original, "waktu_selesai")).format("DD-MM-YYYY")}`,
   },
   {
      accessorKey: "rencana_total_anggaran",
      header: "rencanca total anggaran",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "rencana_total_anggaran")),
   },
   {
      accessorKey: "total_anggaran",
      header: "total anggaran",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "total_anggaran")),
   },
];
export { getColumns };
