import ConfirmDialog from "@/components/confirm-delete";
import { getStatusValidasiSesuai, getValue } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { jenis_iku } from "./helpers";

type ColumnDeps = { limit: number; offset: number; status_usulan?: string };

export const getColumns = ({ limit, offset, status_usulan }: ColumnDeps): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: "",
      cell: ({ row: { original } }) => {
         return (
            status_usulan &&
            ["draft", "rejected"].includes(status_usulan) &&
            getValue(original, "approve") !== "sesuai" && (
               <ConfirmDialog
                  url={`/usulan-kegiatan/${getValue(original, "id_usulan")}/iku/${getValue(original, "id")}`}
                  refetchKey={[["usulan-kegiatan", getValue(original, "id_usulan"), "iku", limit, offset]]}
               />
            )
         );
      },
      meta: { className: "text-start w-[20px]" },
   },
   {
      accessorKey: "jenis_iku",
      header: "jenis",
      enableSorting: true,
      cell: ({ row: { original } }) => jenis_iku?.[getValue(original, "jenis_iku")],
   },
   {
      accessorKey: "kode_iku",
      header: "kode",
      enableSorting: true,
   },
   {
      accessorKey: "deskripsi_iku",
      header: "deskripsi",
      enableSorting: true,
   },
   {
      accessorKey: "tahun_berlaku_iku",
      header: "tahun",
      enableSorting: true,
   },
   {
      accessorKey: "status",
      header: "status",
      enableSorting: true,
      cell: ({ row: { original } }) => getStatusValidasiSesuai(getValue(original, "approve")),
      meta: { className: "text-end" },
   },
];
