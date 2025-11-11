export type Lists = Record<string, string | null>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormData = Record<string, any>;

export type Option = {
   value: string;
   label: string;
};

export interface UserValidationItem {
   id: number;
   username: string;
   level_unit: string;
   roles: {
      nama: string;
   };
   pengguna_role: {
      id_biro: number | null;
      id_lembaga: number | null;
      id_upt: number | null;
      id_fakultas: number | null;
      id_sub_unit: number | null;
   };
}

export interface ApiResponse<T = unknown> {
   message: string;
   data?: T;
   results?: { [key: string]: string };
   total?: number;
   errors?: Lists;
   status: boolean;
   code?: number;
}
