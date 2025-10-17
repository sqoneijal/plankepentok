import { Button } from "@/components/ui/button";
import { getValue } from "@/helpers/init";
import { useDialog, useHeaderButton, useStatusUsulanKegiatan, useTablePagination } from "@/hooks/store";
import { queryClient } from "@/lib/queryClient";
import { useApiQuery, usePostMutation } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useEffect } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

export function useIKUPage() {
   const { pagination } = useTablePagination();
   const { setButton } = useHeaderButton();
   const { id_usulan_kegiatan } = useParams();
   const { setOpen } = useDialog();
   const { status } = useStatusUsulanKegiatan();

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const submit = usePostMutation(`/usulan-kegiatan/${id_usulan_kegiatan}/iku/actions`);

   useEffect(() => {
      if (["draft", "rejected"].includes(status)) {
         setButton(
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
               Tambah Relasi IKU
            </Button>
         );
      }
      return () => {
         setButton(<div />);
      };
   }, [setButton, setOpen, status]);

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "iku", limit, offset],
      url: `/usulan-kegiatan/${id_usulan_kegiatan}/iku`,
      params: { limit, offset },
   });

   const handleRowClick = (row: Lists) => {
      submit.mutate(
         {
            id_usulan: id_usulan_kegiatan,
            id_iku: getValue(row, "id"),
         },
         {
            onSuccess: (data) => {
               if (data?.status) {
                  queryClient.refetchQueries({ queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "iku", limit, offset] });
                  toast.success(data?.message);
                  setOpen(false);
                  return;
               }

               toast.error(data?.message);
            },
            onError: (error: Error) => {
               toast.error(error.message);
            },
         }
      );
   };

   if (error) toast.error(error?.message);

   return { data, isLoading, error, handleRowClick, limit, offset };
}
