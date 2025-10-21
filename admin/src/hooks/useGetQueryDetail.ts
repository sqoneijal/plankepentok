import { toast } from "sonner";
import { useApiQuery } from "./useApiQuery";

export function useGetQueryDetail(enpoint: string, id: string | undefined) {
   const { data, isLoading, error } = useApiQuery({
      url: `${enpoint}/${id}`,
      options: { enabled: !!id },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = data?.results ?? [];

   return { results, isLoading };
}
