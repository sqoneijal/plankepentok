import { useHeaderButton, useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { LinkButton } from "@/lib/helpers";
import { useEffect } from "react";
import { toast } from "sonner";

export function useInitPage() {
   const { setButton } = useHeaderButton();
   const { pagination } = useTablePagination();

   useEffect(() => {
      setButton(<LinkButton label="Tambah Lembaga" url="/unit-kerja/lembaga/actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const { data, isLoading, error } = useApiQuery({
      url: "/unit-kerja/lembaga",
      params: { limit, offset },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.results) ? data?.results : [];

   return { results, total: data?.total ?? 0, isLoading };
}
