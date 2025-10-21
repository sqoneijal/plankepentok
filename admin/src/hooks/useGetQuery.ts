import { toast } from "sonner";
import { useTablePagination } from "./store";
import { useApiQuery } from "./useApiQuery";

type FormData = Record<string, string>;

export function useGetQuery(enpoint: string, params?: FormData) {
   const { pagination } = useTablePagination();

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const { data, isLoading, error } = useApiQuery({
      url: enpoint,
      params: { limit: String(limit), offset: String(offset), ...params },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.results) ? data?.results : [];
   const total = data?.total || 0;

   return { results, total, isLoading };
}
