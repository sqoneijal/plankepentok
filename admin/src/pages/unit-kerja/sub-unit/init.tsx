import { useHeaderButton, useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { LinkButton } from "@/lib/helpers";
import { useEffect } from "react";
import { toast } from "sonner";

export function useInitPage() {
   const { setButton } = useHeaderButton();
   const { pagination } = useTablePagination();

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   useEffect(() => {
      setButton(<LinkButton label="Tambah Sub Unit" url="/unit-kerja/sub-unit/actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   return { limit, offset };
}

export function useTableData({ limit, offset }: { limit: number; offset: number }) {
   const { data, isLoading, error } = useApiQuery({
      url: "/unit-kerja/sub-unit",
      params: { limit, offset },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.results) ? data?.results : [];
   const total = data?.total || 0;

   return { results, total, isLoading };
}
