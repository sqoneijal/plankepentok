import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useParams } from "react-router";

export function useDokumenData() {
   const { id_usulan_kegiatan } = useParams();
   const { pagination } = useTablePagination();

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["verifikasi-usulan", "perbaikan", id_usulan_kegiatan, "dokumen", limit, offset],
      url: `/verifikasi-usulan/perbaikan/${id_usulan_kegiatan}/dokumen`,
      params: { limit, offset },
      options: { enabled: !!id_usulan_kegiatan },
   });

   return { data, isLoading, error };
}
