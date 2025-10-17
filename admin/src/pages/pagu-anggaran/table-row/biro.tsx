import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import { toRupiah } from "@/helpers/init";
import { FormInput } from "@/lib/helpers";
import { Save, SquarePen, SquareX } from "lucide-react";
import React, { lazy, Suspense, useState } from "react";
import { useUpdatePaguBiro, type BiroData, type FakultasData, type FormData, type LembagaData, type ProdiData } from "../init";

const tableCellClass = "font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words";

const loading = Array.from({ length: 5 }, (_, i) => (
   <TableRow key={`loading-level-2-${i}`}>
      <TableCell className="w-[20px]">
         <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="w-[20px]">
         <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell colSpan={2}>
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

const Lembaga = lazy(() => import("./lembaga"));
const Fakultas = lazy(() => import("./fakultas"));

export default function Biro({
   content,
   paguLembaga,
   isLoadingPaguLembaga,
   paguFakultas,
   isLoadingPaguFakultas,
   paguProdi,
   isLoadingPaguProdi,
}: {
   isLoadingPaguLembaga: boolean;
   isLoadingPaguFakultas: boolean;
   isLoadingPaguProdi: boolean;
   content: Array<BiroData>;
   paguLembaga: Array<LembagaData>;
   paguFakultas: Array<FakultasData>;
   paguProdi: Array<ProdiData>;
}) {
   const [formData, setFormData] = useState<FormData>({});

   const { onSubmit, isPending } = useUpdatePaguBiro({ id: formData?.id, total_pagu: Number(formData?.total_pagu || 0), setFormData });

   const actionButton = (row: BiroData) => {
      return formData?.id === String(row.pagu_anggaran?.id) ? (
         <>
            <Button className="size-5" variant="ghost" onClick={() => setFormData({})}>
               <SquareX />
            </Button>
            <Button variant="ghost" className="size-5" disabled={isPending} onClick={onSubmit}>
               {isPending ? <Spinner /> : <Save />}
            </Button>
         </>
      ) : (
         <Button
            className="size-5"
            variant="ghost"
            onClick={() => setFormData({ id: String(row.pagu_anggaran?.id), total_pagu: row.pagu_anggaran?.total_pagu || "" })}>
            <SquarePen />
         </Button>
      );
   };

   return content?.map((row) => (
      <React.Fragment key={`biro-${row.id}`}>
         <TableRow>
            <TableCell className="w-[20px]" />
            <TableCell className={tableCellClass} colSpan={3}>
               {row.nama}
            </TableCell>
            <TableCell className={tableCellClass}>{toRupiah(row.realisasi)}</TableCell>
            <TableCell className={tableCellClass}>
               {formData?.id === String(row.id) ? (
                  <FormInput
                     divClassName="-mt-2"
                     className="h-6"
                     onChange={(value) => setFormData({ ...formData, total_pagu: value })}
                     value={formData.total_pagu}
                  />
               ) : (
                  toRupiah(row.pagu_anggaran?.total_pagu || "0")
               )}
            </TableCell>
            <TableCell className={tableCellClass}>
               <div className="float-end">{actionButton(row)}</div>
            </TableCell>
         </TableRow>
         <Suspense fallback={loading}>{isLoadingPaguLembaga ? loading : <Lembaga id_biro={String(row.id)} content={paguLembaga} />}</Suspense>
         <Suspense fallback={loading}>
            {isLoadingPaguFakultas ? (
               loading
            ) : (
               <Fakultas id_biro={String(row.id)} content={paguFakultas} paguProdi={paguProdi} isLoadingPaguProdi={isLoadingPaguProdi} />
            )}
         </Suspense>
      </React.Fragment>
   ));
}
