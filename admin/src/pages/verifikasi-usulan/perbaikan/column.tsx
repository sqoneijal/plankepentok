import { Button } from "@/components/ui/button";
import { toRupiah } from "@/helpers/init";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import moment from "moment";
import React from "react";

export type Unit = {
   id: number;
   nama: string;
};

export type UnitPengusul = {
   biro_master?: Unit | null;
   fakultas_master?: Unit | null;
   lembaga_master?: Unit | null;
   sub_unit?: Unit | null;
   upt_master?: Unit | null;
};

export type UsulanKegiatan = {
   id: number;
   kode: string;
   jenis_usulan: { nama: string };
   id_jenis_usulan?: number;
   tanggal_submit: string;
   rencana_total_anggaran: number;
   total_anggaran: number;
   pengguna: { fullname: string };
   unit_pengusul: UnitPengusul;
};

type RowData = UsulanKegiatan & {
   verikator_usulan: { id: number };
};

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (value: unknown) => React.ReactNode;
};

const getActiveUnit = (unit_pengusul: UnitPengusul) => {
   if (!unit_pengusul) return null;
   const keys = Object.keys(unit_pengusul) as Array<keyof UnitPengusul>;

   let unit;

   for (const key of keys) {
      const value: Unit | null | undefined = unit_pengusul[key];
      if (value != null) {
         unit = value?.nama;
      }
   }

   return unit;
};

const getNestedValue = (obj: RowData, path: string): unknown => {
   return path.split(".").reduce((current: Record<string, unknown>, key: string) => {
      return current?.[key] as Record<string, unknown>;
   }, obj as Record<string, unknown>);
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
      key: "tanggal_submit",
      header: "tanggal pengajuan",
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
   {
      key: "rencana_total_anggaran",
      header: "rencana",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "total_anggaran",
      header: "rencana rab",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "pengguna.fullname",
      header: "operator",
   },
   {
      key: "unit_pengusul",
      header: "unit pengusul",
      cell: (value: unknown) => getActiveUnit(value as UnitPengusul),
   },
];

export const getColumns = (endpoint: string, navigate: (path: string) => void): Array<ColumnDef<RowData, unknown>> => {
   return [
      columnHelper.display({
         id: "actions",
         header: "",
         cell: ({ row: { original } }) => {
            return (
               <Button variant="outline" className="size-6" onClick={() => navigate(`${endpoint}/${original.id}`)}>
                  <Eye />
               </Button>
            );
         },
         meta: { className: "w-[10px]" },
      }),
      ...columnConfigs.map((config) =>
         columnHelper.accessor((row) => getNestedValue(row, config.key), {
            header: config.header,
            cell: config.cell ? (info) => config.cell!(info.getValue()) : (info) => info.getValue(),
         })
      ),
   ];
};
