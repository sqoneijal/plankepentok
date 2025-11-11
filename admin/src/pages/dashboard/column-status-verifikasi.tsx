import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toRupiah } from "@/helpers/init";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import moment from "moment";

interface KlaimVerifikasi {
   status_klaim: string;
   verikator_usulan: {
      tahap: string;
      pengguna: {
         fullname: string;
      };
   };
}

interface RowData {
   id: number;
   kode: string;
   tanggal_submit: string;
   jenis_usulan: {
      nama: string;
   };
   rencana_total_anggaran: number;
   total_anggaran: number;
   anggaran_disetujui: {
      jumlah: number;
   };
   klaim_verifikasi: KlaimVerifikasi[];
}

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "klaim_verifikasi",
      header: "verifikator",
      cell: (value: unknown) => {
         if (!value || !Array.isArray(value) || value.length === 0) return "-";

         const tahap = value[0]?.verikator_usulan.tahap;
         const verifikator = value[0]?.verikator_usulan.pengguna.fullname;

         return `${tahap} -> ${verifikator}`;
      },
   },
   {
      key: "kode",
      header: "kode",
   },
   {
      key: "tanggal_submit",
      header: "tanggal pengajuan",
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
   {
      key: "jenis_usulan.nama",
      header: "jenis",
   },
   {
      key: "rencana_total_anggaran",
      header: "rencana",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "total_anggaran",
      header: "pengajuan",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "anggaran_disetujui.jumlah",
      header: "disetujui",
      cell: (value: unknown) => toRupiah(value),
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         const status_klaim = original?.klaim_verifikasi[0]?.status_klaim;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columnHelper.accessor(config.key as any, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => String(info.getValue()),
      })
   ),
];
