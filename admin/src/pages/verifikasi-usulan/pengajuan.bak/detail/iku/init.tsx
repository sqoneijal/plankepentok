import { useTablePagination } from "@/hooks/store";
import { queryClient } from "@/lib/queryClient";
import { useApiQuery, usePutMutation } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useParams } from "react-router";
import { toast } from "sonner";

export function useIKUData() {
   const { id_usulan_kegiatan } = useParams();
   const { pagination } = useTablePagination();

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["verifikasi-usulan", "pengajuan", id_usulan_kegiatan, "iku", limit, offset],
      url: `/verifikasi-usulan/pengajuan/${id_usulan_kegiatan}/iku`,
      params: { limit, offset },
      options: { enabled: !!id_usulan_kegiatan },
   });

   return { data, isLoading, error };
}

export function useUpdateIKUBatch() {
   const { id_usulan_kegiatan } = useParams();

   return usePutMutation(`/verifikasi-usulan/pengajuan/iku`, {
      onSuccess: (data) => {
         toast.success(data.message || "Data berhasil diperbarui");
         queryClient.invalidateQueries({ queryKey: ["verifikasi-usulan", "pengajuan", id_usulan_kegiatan, "iku"] });
      },
      onError: (error) => {
         toast.error(error.message || "Gagal memperbarui data");
      },
   });
}
