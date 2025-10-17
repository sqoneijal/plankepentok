import { Button } from "@/components/ui/button";
import { useDialog, useHeaderButton, useStatusUsulanKegiatan, useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

export function useDokumen() {
   const { setButton } = useHeaderButton();
   const { setOpen } = useDialog();
   const { pagination } = useTablePagination();
   const { id_usulan_kegiatan } = useParams();
   const { status } = useStatusUsulanKegiatan();

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;
   const navigate = useNavigate();

   useEffect(() => {
      if (["draft", "rejected"].includes(status)) {
         setButton(
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
               Tambah Dokumen
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
      queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "dokumen", limit, offset],
      url: `/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`,
      params: { limit, offset },
   });

   return { limit, offset, navigate, data, isLoading, error };
}
