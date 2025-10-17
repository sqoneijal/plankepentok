import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toRupiah } from "@/helpers/init";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import moment from "moment";

type RowData = Record<string, unknown>;

export type Row = {
   standar_biaya: { nama: string; kode: string };
   id_satuan: string | number;
   harga_satuan: string | number;
   unit_satuan: { nama: string; deskripsi: string };
   tahun_anggaran: string | number;
   tanggal_mulai_efektif: string;
   tanggal_akhir_efektif: string;
};

const columnHelper = createColumnHelper<Row>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "standar_biaya",
      header: "standar biaya",
      cell: (value: unknown) => {
         const data = value as RowData;
         return `${data.kode} - ${data.nama}`;
      },
   },
   {
      key: "tahun_anggaran",
      header: "tahun",
   },
   {
      key: "harga_satuan",
      header: "harga satuan",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "unit_satuan",
      header: "satuan",
      cell: (value: unknown) => {
         const data = value as RowData;
         return (
            <Tooltip>
               <TooltipTrigger>{data.nama as string}</TooltipTrigger>
               <TooltipContent>{data.deskripsi as string}</TooltipContent>
            </Tooltip>
         );
      },
   },
   {
      key: "tanggal_mulai_efektif",
      header: "mulai efektif",
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
   {
      key: "tanggal_akhir_efektif",
      header: "akhir efektif",
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
];

export const getColumns = (): Array<ColumnDef<Row, unknown>> =>
   columnConfigs.map(
      (config) =>
         columnHelper.accessor(config.key as keyof Row, {
            header: config.header,
            cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
         }) as ColumnDef<Row, unknown>
   );
