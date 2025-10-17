import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { useDataEdit, useDialog, useHeaderButton, useStatusUsulanKegiatan, useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { lazy, Suspense, useEffect } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { loadingElement } from "../helper";
import { getColumns } from "./column";

const DialogAction = lazy(() => import("./dialog-action"));

export default function Page() {
   const { pagination } = useTablePagination();
   const { setButton } = useHeaderButton();
   const { id_usulan_kegiatan } = useParams();
   const { setOpen } = useDialog();
   const { status } = useStatusUsulanKegiatan();
   const { setDataEdit } = useDataEdit();

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "rab", limit, offset],
      url: `/usulan-kegiatan/${id_usulan_kegiatan}/rab`,
      params: { limit, offset },
   });

   useEffect(() => {
      if (status === "draft" || status === "rejected") {
         setButton(
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
               Tambah RAB
            </Button>
         );
      }

      return () => {
         setButton(<div />);
      };
   }, [setButton, setOpen, status]);

   if (error) return toast.error(error?.message);

   return (
      <>
         <Suspense fallback={loadingElement}>
            <DialogAction />
         </Suspense>
         <Table
            columns={getColumns({ setDataEdit, setOpen, limit, offset, status_usulan: status })}
            data={Array.isArray(data?.results) ? data?.results : []}
            total={data?.total ?? 0}
            isLoading={isLoading}
         />
      </>
   );
}
