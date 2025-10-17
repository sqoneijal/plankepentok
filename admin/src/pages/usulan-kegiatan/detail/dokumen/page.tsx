import Table from "@/components/table";
import { useStatusUsulanKegiatan } from "@/hooks/store";
import { Suspense, lazy } from "react";
import { toast } from "sonner";
import { getColumns } from "./column";
import LoadingElement from "./loading-element";
import { useDokumen } from "./use-dokumen";

const ActionDialog = lazy(() => import("./action-dialog"));

export default function Page() {
   const { status } = useStatusUsulanKegiatan();
   const { limit, offset, data, isLoading, error } = useDokumen();

   if (error) return toast.error(error?.message);

   return (
      <>
         <Suspense fallback={<LoadingElement />}>
            <ActionDialog />
         </Suspense>
         <Table
            columns={getColumns({ limit, offset, status_usulan: status })}
            data={Array.isArray(data?.results) ? data?.results : []}
            total={data?.total ?? 0}
            isLoading={isLoading}
         />
      </>
   );
}
