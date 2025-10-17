import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePostMutation } from "@/hooks/usePostMutation";
import { useState } from "react";
import { toast } from "sonner";

type FormData = Record<string, string>;

export function useInitPage() {
   const { pagination } = useTablePagination();

   const [search, setSearch] = useState("");
   const [tahun_berlaku, setTahun_berlaku] = useState("");

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const { data, isLoading, error } = useApiQuery({
      url: "/master-iku",
      params: { limit, offset, search, tahun_berlaku },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.results) ? data?.results : [];
   const total = data?.total || 0;

   return { results, total, isLoading, setSearch, search, tahun_berlaku, setTahun_berlaku };
}

export function useCreateRelasiIKU(id_usulan_kegiatan: string) {
   const { mutate, isPending } = usePostMutation<FormData, unknown>("/usulan-kegiatan/relasi-iku", (data) => ({ ...data }), [
      [`/usulan-kegiatan/relasi-iku/${id_usulan_kegiatan}`],
   ]);

   return { mutate, isPending };
}
