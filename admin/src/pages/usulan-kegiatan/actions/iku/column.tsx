import ConfirmDialog from "@/components/confirm-delete";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

type RowData = Record<string, unknown>;

type IkuData = {
   kode?: string;
   jenis?: string;
   deskripsi?: string;
   tahun_berlaku?: string;
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
      cell: ({ row: { original } }) => (
         <ConfirmDialog
            url={`/usulan-kegiatan/relasi-iku`}
            id={original.id as string | number}
            refetchKey={[[`/usulan-kegiatan/relasi-iku/${id_usulan_kegiatan}`]]}
         />
      ),
      meta: { className: "w-[10px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue() as IkuData) : (info) => info.getValue(),
      })
   ),
];
