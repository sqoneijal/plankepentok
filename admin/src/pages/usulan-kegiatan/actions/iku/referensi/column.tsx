import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

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
      key: "jenis",
      header: "jenis",
      cell: (value: unknown) => {
         if (value === "rektor") return "Rektor";
         if (value === "perguruan_tinggi") return "Perguruan Tinggi";
         return String(value);
      },
   },
   {
      key: "deskripsi",
      header: "deskripsi",
   },
   {
      key: "tahun_berlaku",
      header: "tahun",
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> =>
   columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
      })
   );
