import { InfoPaguUniversitasSkeleton, PaguTableSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetQueryDetail } from "@/lib/utils";
import { lazy, Suspense } from "react";
import { useParams } from "react-router";
import { tableHeadClass, usePaguBiro, usePaguFakultas, usePaguLembaga, usePaguSubUnit, usePaguUPT } from "./init";

const InfoPaguUniversitas = lazy(() => import("./info-pagu-universitas"));
const RowPaguBiro = lazy(() => import("./row-pagu-biro"));
const RowPaguLembaga = lazy(() => import("./row-pagu-lembaga"));
const RowPaguUPT = lazy(() => import("./row-pagu-upt"));
const RowPaguFakultas = lazy(() => import("./row-pagu-fakultas"));

const endpoint = "/pagu-anggaran";

export default function Page() {
   const { id } = useParams();
   const { results: content, isLoading } = useGetQueryDetail(endpoint, id);
   const { paguBiro, isLoadingPaguBiro } = usePaguBiro(content?.tahun_anggaran);
   const { paguLembaga, isLoadingpaguLembaga } = usePaguLembaga(content?.tahun_anggaran);
   const { paguUPT, isLoadingpaguUPT } = usePaguUPT(content?.tahun_anggaran);
   const { paguFakultas, isLoadingpaguFakultas } = usePaguFakultas(content?.tahun_anggaran);
   const { paguSubUnit, isLoadingpaguSubUnit } = usePaguSubUnit(content?.tahun_anggaran);

   return (
      <Card>
         <CardContent>
            {isLoading ? (
               <InfoPaguUniversitasSkeleton />
            ) : (
               <Suspense fallback={<InfoPaguUniversitasSkeleton />}>
                  <InfoPaguUniversitas content={content} />
               </Suspense>
            )}
            <div className="overflow-hidden rounded-lg border shadow-sm mt-4">
               <Table className="w-full">
                  <TableHeader className="bg-muted sticky top-0 z-10">
                     <TableRow>
                        <TableHead colSpan={2} className={tableHeadClass}>
                           Unit
                        </TableHead>
                        <TableHead className={tableHeadClass}>Realisasi</TableHead>
                        <TableHead className={tableHeadClass}>Jumlah Pagu</TableHead>
                        <TableHead className="w-[100px]" />
                     </TableRow>
                  </TableHeader>
                  <TableBody className="font-medium divide-y divide-gray-200">
                     <Suspense fallback={<PaguTableSkeleton />}>
                        <RowPaguBiro isLoading={isLoadingPaguBiro} content={paguBiro} paguSubUnit={paguSubUnit} />
                     </Suspense>
                     <Suspense fallback={<PaguTableSkeleton />}>
                        <RowPaguLembaga isLoading={isLoadingpaguLembaga} content={paguLembaga} paguSubUnit={paguSubUnit} />
                     </Suspense>
                     <Suspense fallback={<PaguTableSkeleton />}>
                        <RowPaguUPT isLoading={isLoadingpaguUPT} content={paguUPT} paguSubUnit={paguSubUnit} />
                     </Suspense>
                     <Suspense fallback={<PaguTableSkeleton />}>
                        <RowPaguFakultas isLoading={isLoadingpaguFakultas} content={paguFakultas} paguSubUnit={paguSubUnit} />
                     </Suspense>
                     {isLoadingpaguSubUnit ? <PaguTableSkeleton /> : ""}
                  </TableBody>
               </Table>
            </div>
         </CardContent>
      </Card>
   );
}
