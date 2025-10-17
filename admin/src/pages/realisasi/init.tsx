import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useNavigate } from "react-router";

export function usePaguAnggaranFakultas() {
   const { pagination } = useTablePagination();

   const navigate = useNavigate();
   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["realisasi", limit, offset],
      url: "/realisasi",
      params: { limit, offset },
   });

   return { data, isLoading, error, navigate, limit, offset };
}
