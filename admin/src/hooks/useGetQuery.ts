import { toast } from "sonner";
import { useTablePagination } from "./store";
import { useApiQuery } from "./useApiQuery";

type FormData = Record<string, string>;

export function useGetQuery(enpoint: string, params?: FormData, usePagination: boolean = true) {
   const { pagination } = useTablePagination();

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const paginationParams = params ? { limit: String(limit), page: String(offset), ...params } : { limit: String(limit), page: String(offset) };

   const { data, isLoading, error } = useApiQuery({
      url: enpoint,
      params: usePagination ? paginationParams : params,
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.data) ? data?.data : [];
   const total = data?.meta?.total || 0;

   return { results, total, isLoading };
}
