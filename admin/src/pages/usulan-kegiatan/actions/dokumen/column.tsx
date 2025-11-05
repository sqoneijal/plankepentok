import ConfirmDialog from "@/components/confirm-delete";
import { LinkButton } from "@/lib/helpers";
import type { FormData } from "@/types/init";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";

type RowData = Record<string, unknown>;

type IkuData = {
   kode?: string;
   jenis?: string;
   deskripsi?: string;
   tahun_berlaku?: string;
};

type VerifikasiItem = {
   id_referensi: string | number;
   status: string;
   catatan: string;
};

type UsulanKegiatan = {
   status_usulan: string;
   verifikasi: Array<VerifikasiItem>;
};

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "nama_dokumen",
      header: "nama",
   },
   {
      key: "tipe_dokumen",
      header: "tipe",
   },
   {
      key: "file_dokumen",
      header: "dokumen",
   },
   {
      key: "path_file",
      header: "lokasi",
      cell: (value: unknown) => (
         <a href={value as string} target="_blank">
            {value as string}
         </a>
      ),
   },
];

export const getColumns = (
   setOpenSheet: (open: boolean) => void,
   setDetailRow: (data: FormData) => void,
   id_usulan_kegiatan?: string
): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         const usulanKegiatan = original?.usulan_kegiatan as UsulanKegiatan;
         const status_usulan = usulanKegiatan?.status_usulan;
         const verifikasi = usulanKegiatan?.verifikasi.find((e: VerifikasiItem) => e.id_referensi === (original.id as string | number));
         const status_verifikasi = verifikasi?.status;

         return (
            ["", "draft", "ditolak", "perbaiki"].includes(status_usulan) &&
            status_verifikasi !== "sesuai" && (
               <>
                  <LinkButton
                     label={<SquarePen />}
                     type="edit"
                     onClick={() => {
                        setOpenSheet(true);
                        setDetailRow(Object.fromEntries(Object.entries(original).map(([k, v]) => [k, String(v)])));
                     }}
                  />
                  <ConfirmDialog
                     url={`/usulan-kegiatan/dokumen`}
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
         const usulanKegiatan = original?.usulan_kegiatan as UsulanKegiatan;
         const verifikasi = usulanKegiatan?.verifikasi.find((e: VerifikasiItem) => e.id_referensi === (original.id as string | number));
         const status_verifikasi = verifikasi?.status;

         if (status_verifikasi !== "valid") {
            return verifikasi?.catatan;
         }
      },
   }),
];
