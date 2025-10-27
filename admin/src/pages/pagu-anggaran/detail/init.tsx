import { useApiQuery } from "@/hooks/useApiQuery";
import { toast } from "sonner";

export const tableHeadClass = "h-8 text-xs font-medium text-gray-500 uppercase tracking-wider";
export const tableCellClass = "font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words";

export interface PaguBiroRow {
   id: number;
   tahun_anggaran: string;
   total_pagu: string;
   realisasi: string | null;
   id_biro: number;
   biro_master: {
      id: number;
      nama: string;
      sub_unit: {
         id: number;
         nama: string;
      }[];
   };
}

export interface PaguLembagaRow {
   id: number;
   tahun_anggaran: string;
   total_pagu: string;
   realisasi: string;
   id_lembaga: number;
   lembaga_master: {
      id: number;
      nama: string;
      sub_unit: {
         id: number;
         nama: string;
      }[];
   };
}

export interface PaguUPTRow {
   id: number;
   tahun_anggaran: string;
   total_pagu: string;
   realisasi: string;
   id_upt: number;
   upt_master: {
      id: number;
      nama: string;
      sub_unit: {
         id: number;
         nama: string;
      }[];
   };
}

export interface PaguFakultasRow {
   id: number;
   tahun_anggaran: string;
   total_pagu: string;
   realisasi: string;
   id_fakultas: number;
   fakultas_master: {
      id: number;
      nama: string;
      sub_unit: {
         id: number;
         nama: string;
      }[];
   };
}

export interface PaguSubUnitRow {
   id: number;
   id_sub_unit: number;
   tahun_anggaran: string;
   total_pagu: string;
   realisasi: string;
   sub_unit: {
      id: number;
      level: string;
      nama: string;
      id_biro: number | null;
      id_lembaga: number | null;
      id_upt: number | null;
      id_fakultas: number | null;
   };
}

export type PaguParentRow = PaguBiroRow | PaguLembagaRow | PaguUPTRow | PaguFakultasRow;

export function useInitPage(id?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/pagu-anggaran/${id}`,
      options: { enabled: !!id },
   });

   if (error) {
      toast.error(error?.message);
   }

   const content = data?.results || {};

   return { content, isLoading };
}

export function usePaguBiro(tahun?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/pagu-anggaran/${tahun}/biro`,
      options: { enabled: !!tahun },
   });

   if (error) {
      toast.error(error?.message);
   }

   const paguBiro = data?.results || [];

   return { paguBiro, isLoadingPaguBiro: isLoading };
}

export function usePaguLembaga(tahun?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/pagu-anggaran/${tahun}/lembaga`,
      options: { enabled: !!tahun },
   });

   if (error) {
      toast.error(error?.message);
   }

   const paguLembaga = data?.results || [];

   return { paguLembaga, isLoadingpaguLembaga: isLoading };
}

export function usePaguUPT(tahun?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/pagu-anggaran/${tahun}/upt`,
      options: { enabled: !!tahun },
   });

   if (error) {
      toast.error(error?.message);
   }

   const paguUPT = data?.results || [];

   return { paguUPT, isLoadingpaguUPT: isLoading };
}

export function usePaguFakultas(tahun?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/pagu-anggaran/${tahun}/fakultas`,
      options: { enabled: !!tahun },
   });

   if (error) {
      toast.error(error?.message);
   }

   const paguFakultas = data?.results || [];

   return { paguFakultas, isLoadingpaguFakultas: isLoading };
}

export function usePaguSubUnit(tahun?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/pagu-anggaran/${tahun}/sub-unit`,
      options: { enabled: !!tahun },
   });

   if (error) {
      toast.error(error?.message);
   }

   const paguSubUnit = data?.results || [];

   return { paguSubUnit, isLoadingpaguSubUnit: isLoading };
}
