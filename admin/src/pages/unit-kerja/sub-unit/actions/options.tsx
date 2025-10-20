import { useApiQuery } from "@/hooks/useApiQuery";
import { toast } from "sonner";

export function useOptionsParentUnit() {
   const { data, isLoading, error } = useApiQuery({
      url: "/unit-kerja/sub-unit/options",
   });

   if (error) {
      toast.error(error?.message);
   }

   const parentUnit = data?.results ?? [];

   return { parentUnit, isLoadingParentUnit: isLoading };
}
