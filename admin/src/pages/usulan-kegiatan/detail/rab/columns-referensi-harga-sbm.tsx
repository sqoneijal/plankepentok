import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getValue, toRupiah } from "@/helpers/init";
import type { Lists } from "@/types/init";
import type { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

const renderTanggalEfektif = (tanggal_mulai: string, tanggal_akhir: string) => {
   const content: React.ReactNode = moment(tanggal_mulai).format("DD-MM-YYYY");

   if (tanggal_akhir) {
      return (
         <>
            {content} s.d {moment(tanggal_akhir).format("DD-MM-YYYY")}
         </>
      );
   }
   return content;
};

export const getColumnsDialog = (): Array<ColumnDef<Lists>> => [
   {
      accessorKey: "kode_standar_biaya",
      header: "kode",
      enableSorting: true,
   },
   {
      accessorKey: "nama_standar_biaya",
      header: "nama",
      enableSorting: true,
   },
   {
      accessorKey: "tahun_anggaran",
      header: "tahun",
      enableSorting: true,
   },
   {
      accessorKey: "harga_satuan",
      header: "harga",
      enableSorting: true,
      cell: ({ row: { original } }) => toRupiah(getValue(original, "harga_satuan")),
   },
   {
      accessorKey: "nama_satuan",
      header: "satuan",
      enableSorting: true,
      cell: ({ row: { original } }) => (
         <Tooltip>
            <TooltipTrigger>{getValue(original, "nama_satuan")}</TooltipTrigger>
            <TooltipContent>{getValue(original, "status_satuan") === "t" ? "Aktif" : "Tidak Aktif"}</TooltipContent>
         </Tooltip>
      ),
   },
   {
      accessorKey: "efektif",
      header: "efektif",
      enableSorting: true,
      cell: ({ row: { original } }) => renderTanggalEfektif(getValue(original, "tanggal_mulai_efektif"), getValue(original, "tanggal_akhir_efektif")),
   },
   {
      accessorKey: "status_validasi",
      header: "status",
      enableSorting: true,
      cell: ({ row: { original } }) => (
         <Badge variant="outline">{getValue(original, "status_validasi").replace(/\b\w/g, (l) => l.toUpperCase())}</Badge>
      ),
   },
];
