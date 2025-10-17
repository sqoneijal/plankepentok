import { useHeaderButton, useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { LinkButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useUnitPage() {
   const { setButton } = useHeaderButton();
   const { pagination } = useTablePagination();

   const [search, setSearch] = useState("");

   useEffect(() => {
      setButton(<LinkButton label="Tambah Unit Satuan" url="/referensi/unit-satuan/actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const { data, isLoading, error } = useApiQuery({
      url: "/referensi/unit-satuan",
      params: { limit, offset, search },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.results) ? data?.results : [];

   return { results, total: data?.total ?? 0, isLoading, setSearch, search };
}
