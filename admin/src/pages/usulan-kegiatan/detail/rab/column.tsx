import ConfirmDialog from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusValidasiRAB, getValue, toRupiah } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

const tombolAksi = (
   original: Lists,
   status_usulan: string | undefined,
   limit: number,
   offset: number,
   setOpen: (status: boolean) => void,
   setDataEdit: (dataEdit: Lists) => void
) => {
   const approve = getValue(original, "approve");

   if (status_usulan && ["draft", "rejected"].includes(status_usulan) && approve !== "valid") {
      return (
         <>
            <Button
               variant="ghost"
               onClick={() => {
                  setOpen(true);
                  setDataEdit(original);
               }}>
               <Pencil />
            </Button>
            <ConfirmDialog
               url={`/usulan-kegiatan/actions/rab/${getValue(original, "id")}`}
               refetchKey={[
                  ["usulan-kegiatan", getValue(original, "id_usulan"), "rab", limit, offset],
                  ["usulan-kegiatan", getValue(original, "id_usulan"), "anggaran"],
                  ["usulan-kegiatan", limit, offset],
               ]}
            />
         </>
      );
   }
};

export type ColumnDeps = {
   limit: number;
   offset: number;
   status_usulan?: string;
   setOpen: (status: boolean) => void;
   setDataEdit: (dataEdit: Lists) => void;
};

export const getColumns = ({ limit, offset, status_usulan, setOpen, setDataEdit }: ColumnDeps): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "aksi",
      header: "",
      cell: ({ row: { original } }) => tombolAksi(original, status_usulan, limit, offset, setOpen, setDataEdit),
      meta: { className: "text-start w-[100px]" },
   },
   {
      accessorKey: "uraian_biaya",
      header: "uraian",
      enableSorting: true,
   },
   {
      accessorKey: "qty",
      header: "qty",
      enableSorting: true,
   },
   {
      accessorKey: "id_satuan",
      header: "satuan",
      enableSorting: true,
      cell: ({ row: { original } }) => (
         <Tooltip>
            <TooltipTrigger>{getValue(original, "nama_satuan")}</TooltipTrigger>
            <TooltipContent>{getValue(original, "deskripsi_satuan")}</TooltipContent>
         </Tooltip>
      ),
   },
   {
      accessorKey: "harga_satuan",
      header: "harga",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "harga_satuan")),
   },
   {
      accessorKey: "total_biaya",
      header: "total biaya",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "total_biaya")),
   },
   {
      accessorKey: "catatan",
      header: "catatan",
      enableSorting: true,
   },
   {
      accessorKey: "status",
      header: "status",
      enableSorting: true,
      cell: ({ row: { original } }) => getStatusValidasiRAB(getValue(original, "approve")),
      meta: { className: "text-end" },
   },
];
