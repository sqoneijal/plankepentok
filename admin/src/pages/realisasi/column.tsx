import { objectLength, toRupiah } from "@/helpers/init";
import { LinkButton } from "@/lib/helpers";
import { createColumnHelper, type CellContext, type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import moment from "moment";
import React from "react";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

export type Unit = {
   id: number;
   nama: string;
};

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (info: CellContext<RowData, unknown>) => React.ReactNode;
};

export type UnitPengusul = {
   biro_master?: Unit | null;
   fakultas_master?: Unit | null;
   lembaga_master?: Unit | null;
   sub_unit?: Unit | null;
   upt_master?: Unit | null;
};

export const getActiveUnit = (unit_pengusul: UnitPengusul) => {
   if (!unit_pengusul) return null;
   const keys = Object.keys(unit_pengusul) as Array<keyof UnitPengusul>;

   let unit;

   for (const key of keys) {
      const value = unit_pengusul[key];
      if (objectLength(value)) {
         unit = value?.nama;
      }
   }

   return unit;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "kode",
      header: "kode",
   },
   {
      key: "jenis_usulan.nama",
      header: "jenis usulan",
   },
   {
      key: "waktu_mulai",
      header: "waktu mulai",
      cell: (info) => {
         const value = info.getValue();
         return moment(value as string).format("DD-MM-YYYY");
      },
   },
   {
      key: "waktu_selesai",
      header: "waktu selesai",
      cell: (info) => {
         const value = info.getValue();
         return moment(value as string).format("DD-MM-YYYY");
      },
   },
   {
      key: "anggaran_disetujui.jumlah",
      header: "anggaran",
      cell: ({ getValue }) => toRupiah(getValue()),
   },
   {
      key: "unit_pengusul",
      header: "unit",
      cell: ({ getValue }) => getActiveUnit(getValue() as UnitPengusul),
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => {
         return <LinkButton label={<Eye />} url={`${endpoint}/${original.id}`} type="edit" />;
      },
      meta: { className: "w-[10px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ?? ((info) => info.getValue()),
      })
   ),
];
