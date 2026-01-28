import { toast } from "sonner";
import { useApiQuery } from "./useApiQuery";

export function useGetQueryDetail(enpoint: string, id: string | undefined, params?: Record<string, string>) {
   const { data, isLoading, error } = useApiQuery({
      url: `${enpoint}/${id}`,
      options: { enabled: !!id },
      params: { ...params },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = data?.data ?? [];

   return { results, isLoading };
}
