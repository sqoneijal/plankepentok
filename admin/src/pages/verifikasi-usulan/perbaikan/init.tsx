import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";

export function usePerbaikanData() {
   const { pagination } = useTablePagination();

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["verifikasi-usulan", "perbaikan", limit, offset],
      url: "/verifikasi-usulan/perbaikan",
      params: { limit, offset },
   });

   return { data, isLoading, error };
}
