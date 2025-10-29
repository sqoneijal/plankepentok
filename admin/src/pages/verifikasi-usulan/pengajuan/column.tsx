import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toRupiah } from "@/helpers/init";
import { usePutMutation } from "@/hooks/usePutMutation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import moment from "moment";
import React from "react";
import { toast } from "sonner";

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
   tanggal_submit: string;
   rencana_total_anggaran: number;
   total_anggaran: number;
   pengguna: { fullname: string };
   unit_pengusul: UnitPengusul;
};

type RowData = { usulan_kegiatan: UsulanKegiatan; verikator_usulan: Record<string, string> };

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
      key: "usulan_kegiatan.kode",
      header: "kode",
   },
   {
      key: "usulan_kegiatan.jenis_usulan.nama",
      header: "jenis usulan",
   },
   {
      key: "usulan_kegiatan.tanggal_submit",
      header: "tanggal pengajuan",
      cell: (value: unknown) => moment(value as string).format("DD-MM-YYYY"),
   },
   {
      key: "usulan_kegiatan.rencana_total_anggaran",
      header: "rencana",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "usulan_kegiatan.total_anggaran",
      header: "rencana rab",
      cell: (value: unknown) => toRupiah(value),
   },
   {
      key: "usulan_kegiatan.pengguna.fullname",
      header: "operator",
   },
   {
      key: "usulan_kegiatan.unit_pengusul",
      header: "unit pengusul",
      cell: (value: unknown) => getActiveUnit(value as UnitPengusul),
   },
];

export const getColumns = (endpoint: string, navigate: (path: string) => void): Array<ColumnDef<RowData, unknown>> => {
   const mutationHook = usePutMutation<Record<string, string>, unknown>;
   const { mutate, isPending } = mutationHook(`${endpoint}/klaim`, (data) => ({ ...data }), [[endpoint]]);

   return [
      columnHelper.display({
         id: "actions",
         header: "",
         cell: ({ row: { original } }) => {
            return (
               <Button
                  variant="outline"
                  className="size-6"
                  onClick={() =>
                     mutate(
                        {
                           id_usulan_kegiatan: String(original.usulan_kegiatan.id),
                           id_verikator_usulan: String(original.verikator_usulan.id),
                        },
                        {
                           onSuccess: (response) => {
                              const { status, message } = response;
                              if (status) {
                                 navigate(`${endpoint}/${original.usulan_kegiatan.id}`);
                              } else {
                                 toast.error(message);
                              }
                           },
                        }
                     )
                  }>
                  {isPending ? <Spinner /> : <Eye />}
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
