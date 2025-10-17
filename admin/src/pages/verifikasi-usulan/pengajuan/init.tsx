import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";

export function usePengajuanData() {
   const { pagination } = useTablePagination();

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["verifikasi-usulan", "pengajuan", limit, offset],
      url: "/verifikasi-usulan/pengajuan",
      params: { limit, offset },
   });

   return { data, isLoading, error };
}
