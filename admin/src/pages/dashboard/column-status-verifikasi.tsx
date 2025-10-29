import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toRupiah } from "@/helpers/init";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import moment from "moment";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "verikator_usulan.pengguna.fullname",
      header: "verifikator",
   },
   {
      key: "usulan_kegiatan.kode",
      header: "kode",
   },
   {
      key: "usulan_kegiatan.tanggal_submit",
      header: "tanggal pengajuan",
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
   {
      key: "usulan_kegiatan.jenis_usulan.nama",
      header: "jenis",
   },
   {
      key: "usulan_kegiatan.rencana_total_anggaran",
      header: "rencana",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "usulan_kegiatan.total_anggaran",
      header: "anggaran",
      cell: (value: unknown) => toRupiah(value),
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         const status_klaim = original?.status_klaim;
         if (status_klaim === "selesai") {
            return (
               <Badge variant="outline">
                  <IconCircleCheckFilled className="fill-green-400" />
                  Selesai
               </Badge>
            );
         } else if (status_klaim === "aktif") {
            return (
               <Badge variant="outline">
                  <Spinner />
                  ... progress
               </Badge>
            );
         }
      },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => String(info.getValue()),
      })
   ),
];
