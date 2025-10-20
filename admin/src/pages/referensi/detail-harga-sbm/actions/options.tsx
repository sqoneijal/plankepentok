import { useApiQuery } from "@/hooks/useApiQuery";
import { toast } from "sonner";

export function useOptionsTahunAnggaran() {
   const { data, isLoading, error } = useApiQuery({
      url: "/options/tahun-anggaran",
   });

   if (error) {
      toast.error(error?.message);
   }

   const tahunAnggaran = data?.results ?? [];

   return { tahunAnggaran, isLoadingTahunAnggaran: isLoading };
}

export function useOptionsStandarBiaya() {
   const { data, isLoading, error } = useApiQuery({
      url: "/options/standar-biaya",
   });

   if (error) {
      toast.error(error?.message);
   }

   const standarBiaya = data?.results ?? [];

   return { standarBiaya, isLoadingStandarBiaya: isLoading };
}

export function useOptionsUnitSatuan() {
   const { data, isLoading, error } = useApiQuery({
      url: "/options/unit-satuan",
   });

   if (error) {
      toast.error(error?.message);
   }

   const unitSatuan = data?.results ?? [];

   return { unitSatuan, isLoadingUnitSatuan: isLoading };
}
