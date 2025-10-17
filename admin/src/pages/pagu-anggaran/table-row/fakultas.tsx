import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import { toRupiah } from "@/helpers/init";
import { FormInput } from "@/lib/helpers";
import { Save, SquarePen, SquareX } from "lucide-react";
import React, { lazy, Suspense, useState } from "react";
import { useUpdatePaguFakultas, type FakultasData, type FormData, type ProdiData } from "../init";

const tableCellClass = "font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words";

const Prodi = lazy(() => import("./prodi"));

const loading = Array.from({ length: 5 }, (_, i) => (
   <TableRow key={`loading-level-3-${i}`}>
      <TableCell className="w-[20px]">
         <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="w-[20px]">
         <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="w-[20px]">
         <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell>
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

export default function Fakultas({
   id_biro,
   content,
   paguProdi,
   isLoadingPaguProdi,
}: {
   id_biro?: string;
   content: Array<FakultasData>;
   paguProdi: Array<ProdiData>;
   isLoadingPaguProdi: boolean;
}) {
   const [formData, setFormData] = useState<FormData>({});

   const { onSubmit, isPending } = useUpdatePaguFakultas({ id: formData?.id, total_pagu: Number(formData?.total_pagu), setFormData });

   const actionButton = (row: FakultasData) => {
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

   return content
      .filter((e) => String(e.id_biro) === id_biro)
      .map((row) => {
         return (
            <React.Fragment key={`fakultas-${row.id}`}>
               <TableRow>
                  <TableCell className="w-[20px]" />
                  <TableCell className="w-[20px]" />
                  <TableCell className={tableCellClass} colSpan={2}>
                     {row.nama}
                  </TableCell>
                  <TableCell className={tableCellClass}>{toRupiah(row.realisasi)}</TableCell>
                  <TableCell className={tableCellClass}>
                     {formData?.id === String(row.pagu_anggaran?.id) ? (
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
               <Suspense fallback={loading}>{isLoadingPaguProdi ? loading : <Prodi content={paguProdi} id_fakultas={row.id} />}</Suspense>
            </React.Fragment>
         );
      });
}
