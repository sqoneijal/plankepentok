import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useState } from "react";
import { toast } from "sonner";

export function useInitPage() {
   const { pagination } = useTablePagination();

   const [search, setSearch] = useState("");

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const { data, isLoading, error } = useApiQuery({
      url: "/usulan-kegiatan/referensi-sbm",
      params: { limit, offset, search },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.results) ? data?.results : [];
   const total = data?.total || 0;

   return { results, total, isLoading, setSearch, search };
}
