import { Button } from "@/components/ui/button";
import { useHeaderButton, useTablePagination } from "@/hooks/store";
import { queryClient } from "@/lib/queryClient";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function useMasterIKUPage() {
   const [search, setSearch] = useState("");
   const [year, setYear] = useState(moment().year().toString());

   const { setButton } = useHeaderButton();
   const { pagination } = useTablePagination();

   const navigate = useNavigate();
   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   useEffect(() => {
      setButton(
         <Button variant="outline" size="sm" onClick={() => navigate("/master-iku/actions")}>
            Tambah Master IKU
         </Button>
      );
      return () => {
         setButton(<div />);
      };
   }, [setButton, navigate]);

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["master-iku", limit, offset, search, year],
      url: "/master-iku",
      params: { limit, offset, search, year },
   });

   if (error) {
      toast.error(error?.message);
      queryClient.removeQueries({ queryKey: ["master-iku", limit, offset, search, year] });
   }

   return { data, isLoading, error, limit, offset, navigate, search, setSearch, year, setYear };
}
