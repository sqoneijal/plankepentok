import ConfirmDialog from "@/components/confirm-delete";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

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
   catatan?: string;
};

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: IkuData) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "iku_master",
      header: "kode",
      cell: (value) => value?.kode,
   },
   {
      key: "iku_master",
      header: "jenis",
      cell: (value) => {
         if (value.jenis === "rektor") return "Rektor";
         if (value.jenis === "perguruan_tinggi") return "Perguruan Tinggi";
         return String(value.jenis);
      },
   },
   {
      key: "iku_master",
      header: "deskripsi",
      cell: (value) => value?.deskripsi,
   },
   {
      key: "iku_master",
      header: "tahun",
      cell: (value) => value?.tahun_berlaku,
   },
];

export const getColumns = (id_usulan_kegiatan?: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         const status_usulan = (original?.usulan_kegiatan as RowData)?.status_usulan as string;
         const verifikasi = ((original.usulan_kegiatan as RowData).verifikasi as VerifikasiItem[]).find(
            (e) => e.id_referensi === (original.id as string | number)
         );
         const status_verifikasi = verifikasi?.status;

         return (
            ["", "draft", "perbaiki", "ditolak"].includes(status_usulan) &&
            status_verifikasi !== "sesuai" && (
               <ConfirmDialog
                  url={`/usulan-kegiatan/relasi-iku`}
                  id={original.id as string | number}
                  params={id_usulan_kegiatan ? { id_usulan_kegiatan } : undefined}
               />
            )
         );
      },
      meta: { className: "w-[10px]" },
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
         const verifikasi = ((original.usulan_kegiatan as RowData).verifikasi as VerifikasiItem[]).find(
            (e) => e.id_referensi === (original.id as string | number)
         );
         const status_verifikasi = verifikasi?.status;

         if (status_verifikasi !== "sesuai") {
            return verifikasi?.catatan;
         }
      },
   }),
];
