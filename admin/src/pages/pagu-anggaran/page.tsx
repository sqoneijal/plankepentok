import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toRupiah } from "@/helpers/init";
import { FormSelect } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "../../components/ui/skeleton";
import {
   useInitPage,
   useOptions,
   usePaguAnggaranBiro,
   usePaguAnggaranFakultas,
   usePaguAnggaranLembaga,
   usePaguAnggaranProdi,
   usePaguAnggaranUniversitas,
} from "./init";

const Biro = lazy(() => import("./table-row/biro"));

const loading = Array.from({ length: 5 }, (_, i) => (
   <TableRow key={`loading-level-1-${i}`}>
      <TableCell className="w-[20px]" />
      <TableCell colSpan={3}>
         <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell>
         <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell>
         <Skeleton className="h-4 w-full" />
      </TableCell>
   </TableRow>
));

export default function Page() {
   const { daftarTahunAnggaran, isLoadingTahunAnggaran } = useOptions();
   const { formData, setFormData } = useInitPage();

   useEffect(() => {
      if (!isLoadingTahunAnggaran && daftarTahunAnggaran.length > 0) {
         setFormData({
            ...formData,
            tahun_anggaran: daftarTahunAnggaran.find((e: { is_aktif: boolean }) => e.is_aktif === true).tahun_anggaran.toString(),
         });
      }
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isLoadingTahunAnggaran, daftarTahunAnggaran]);

   const { paguUniversitas, isLoadingPaguUniversitas } = usePaguAnggaranUniversitas({ formData, setFormData });
   const { paguBiro, isLoadingPaguBiro } = usePaguAnggaranBiro({ formData, enabled: isLoadingPaguUniversitas });
   const { paguLembaga, isLoadingPaguLembaga } = usePaguAnggaranLembaga({ formData, enabled: isLoadingPaguBiro });
   const { paguFakultas, isLoadingPaguFakultas } = usePaguAnggaranFakultas({ formData, enabled: isLoadingPaguBiro });
   const { paguProdi, isLoadingPaguProdi } = usePaguAnggaranProdi({ formData, enabled: isLoadingPaguFakultas });

   const tableHeadClass = "h-8 text-xs font-medium text-gray-500 uppercase tracking-wider";
   const tableCellClass = "font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words";

   if (isLoadingTahunAnggaran || isLoadingPaguUniversitas) {
      return (
         <div className="p-0">
            <div className="border rounded-lg p-6 shadow-sm bg-white space-y-4">
               {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
               ))}
            </div>
         </div>
      );
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white space-y-4">
            <div className="row">
               <div className="col-12 col-md-2">
                  <FormSelect
                     label="Tahun Anggaran"
                     name="tahun_anggaran"
                     options={daftarTahunAnggaran.map((row: { tahun_anggaran: string }) => ({
                        value: row.tahun_anggaran.toString(),
                        label: row.tahun_anggaran,
                     }))}
                     value={formData?.tahun_anggaran}
                     onChange={(value) => setFormData((prev) => ({ ...prev, tahun_anggaran: value }))}
                  />
               </div>
            </div>
            <div className="overflow-hidden rounded-lg border shadow-sm">
               <Table className="w-full">
                  <TableHeader className="bg-muted sticky top-0 z-10">
                     <TableRow>
                        <TableHead className={tableHeadClass} colSpan={4}>
                           Unit
                        </TableHead>
                        <TableHead className={tableHeadClass}>Realisasi</TableHead>
                        <TableHead className={tableHeadClass}>Jumlah Pagu</TableHead>
                        <TableHead className={cn(tableHeadClass, "w-[80px]")} />
                     </TableRow>
                  </TableHeader>
                  <TableBody className="font-medium divide-y divide-gray-200">
                     <TableRow>
                        <TableCell className={tableCellClass} colSpan={4}>
                           Universitas
                        </TableCell>
                        <TableCell className={tableCellClass}>{toRupiah(paguUniversitas.realisasi)}</TableCell>
                        <TableCell className={tableCellClass} colSpan={2}>
                           <span className="text-start">{toRupiah(paguUniversitas.total_pagu)}</span>
                           <Badge variant="outline" className="float-end">
                              Sisa sebelum realisasi : {toRupiah(formData.sisa_pagu_sementara)}
                           </Badge>
                        </TableCell>
                     </TableRow>
                     {isLoadingPaguBiro ? (
                        loading
                     ) : (
                        <Suspense fallback={loading}>
                           <Biro
                              content={paguBiro}
                              paguLembaga={paguLembaga}
                              isLoadingPaguLembaga={isLoadingPaguLembaga}
                              paguFakultas={paguFakultas}
                              isLoadingPaguFakultas={isLoadingPaguFakultas}
                              paguProdi={paguProdi}
                              isLoadingPaguProdi={isLoadingPaguProdi}
                           />
                        </Suspense>
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>
      </div>
   );
}
