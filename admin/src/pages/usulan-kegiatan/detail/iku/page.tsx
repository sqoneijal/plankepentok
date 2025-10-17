import Table from "@/components/table";
import { useStatusUsulanKegiatan } from "@/hooks/store";
import { lazy, Suspense } from "react";
import { loadingElement } from "./helpers";
import { getColumns } from "./page-column";
import { useIKUPage } from "./use-page";

const DialogIKUMaster = lazy(() => import("./dialog-action"));

export default function Page() {
   const { status } = useStatusUsulanKegiatan();
   const { data, isLoading, handleRowClick, limit, offset } = useIKUPage();

   return (
      <>
         <Suspense fallback={loadingElement}>
            <DialogIKUMaster onRowClick={handleRowClick} />
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
