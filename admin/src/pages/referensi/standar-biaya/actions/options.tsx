import { useApiQuery } from "@/hooks/useApiQuery";
import { toast } from "sonner";

export function useOptionsKategoriSBM() {
   const { data, isLoading, error } = useApiQuery({
      url: "/options/kategori-sbm",
   });

   if (error) {
      toast.error(error?.message);
   }

   const kategoriSBM = data?.results ?? [];

   return { kategoriSBM, isLoadingKategoriSBM: isLoading };
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
