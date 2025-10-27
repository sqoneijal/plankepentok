import ConfirmDialog from "@/components/confirm-delete";
import { createColumnHelper, type CellContext, type ColumnDef } from "@tanstack/react-table";

type PenggunaRole = {
   biro_master?: { id: number; nama: string };
   fakultas_master?: { id: number; nama: string };
   lembaga_master?: { id: number; nama: string };
   sub_unit?: { id: number; nama: string };
   upt_master?: { id: number; nama: string };
};

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (info: CellContext<RowData, unknown>) => React.ReactNode;
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "username",
      header: "username",
   },
   {
      key: "roles.nama",
      header: "role",
   },
   {
      key: "",
      header: "unit kerja",
      cell: (info) => {
         const value = info.row.original;
         const level_unit = value.level_unit || null;

         if (level_unit) {
            const pengguna_role = value?.pengguna_role as PenggunaRole;
            switch (level_unit) {
               case "biro":
                  return pengguna_role?.biro_master?.nama;
               case "fakultas":
                  return pengguna_role?.fakultas_master?.nama;
               case "lembaga":
                  return pengguna_role?.lembaga_master?.nama;
               case "sub_unit":
                  return pengguna_role?.sub_unit?.nama;
               case "upt":
                  return pengguna_role?.upt_master?.nama;
            }
         } else {
            return "-";
         }
      },
   },
];

export const getColumns = (endpoint: string): Array<ColumnDef<RowData, unknown>> => [
   columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row: { original } }) => <ConfirmDialog url={endpoint} id={original.id as string | number} refetchKey={[[endpoint]]} />,
      meta: { className: "w-[10px]" },
   }),
   ...columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info) : (info) => info.getValue(),
      })
   ),
];
