import ConfirmDialog from "@/components/confirm-delete";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";

type RowData = Record<string, unknown>;

type IkuData = {
   kode?: string;
   jenis?: string;
   deskripsi?: string;
   tahun_berlaku?: string;
};

type Verifikasi = {
   id_referensi: number;
   status: string;
   catatan: string;
};

type UsulanKegiatan = {
   status_usulan: string;
   verifikasi: Verifikasi[];
};

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "uraian_biaya",
      header: "uraian biaya",
   },
   {
      key: "qty",
      header: "qty",
   },
   {
      key: "harga_satuan",
      header: "harga satuan",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "total_biaya",
      header: "total biaya",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "unit_satuan",
      header: "satuan",
      cell: (value: unknown) => (
         <Tooltip>
            <TooltipTrigger>{(value as { nama: string }).nama}</TooltipTrigger>
            <TooltipContent>{(value as { deskripsi: string }).deskripsi}</TooltipContent>
         </Tooltip>
      ),
   },
   {
      key: "catatan",
      header: "catatan",
   },
];

export const getColumns = (id_usulan_kegiatan?: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         const status_usulan = (original?.usulan_kegiatan as UsulanKegiatan)?.status_usulan;
         const verifikasi = (original.usulan_kegiatan as UsulanKegiatan)?.verifikasi.find(
            (e: Verifikasi) => e.id_referensi === (original.id as number)
         );
         const status_verifikasi = verifikasi?.status;

         return (
            ["", "draft", "ditolak", "perbaiki"].includes(status_usulan) &&
            status_verifikasi !== "valid" && (
               <>
                  <LinkButton label={<SquarePen />} url={`/usulan-kegiatan/actions/${id_usulan_kegiatan}/rab/${original.id}`} type="edit" />
                  <ConfirmDialog
                     url={`/usulan-kegiatan/rab`}
                     id={original.id as string | number}
                     params={id_usulan_kegiatan ? { id_usulan_kegiatan } : undefined}
                  />
               </>
            )
         );
      },
      meta: { className: "w-[80px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue() as IkuData) : (info) => info.getValue(),
      })
   ),
   columnHelper.display({
      id: "actions",
      header: "catatan perbaikan",
      cell: ({ row: { original } }) => {
         const verifikasi = (original.usulan_kegiatan as UsulanKegiatan)?.verifikasi.find(
            (e: Verifikasi) => e.id_referensi === (original.id as number)
         );
         const status_verifikasi = verifikasi?.status;

         if (status_verifikasi !== "valid") {
            return verifikasi?.catatan;
         }
      },
   }),
];
