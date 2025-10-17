import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import { toRupiah } from "@/helpers/init";
import { FormInput } from "@/lib/helpers";
import { Save, SquarePen, SquareX } from "lucide-react";
import { useState } from "react";
import { useUpdatePaguProdi, type FormData, type ProdiData } from "../init";

const tableCellClass = "font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words";

export default function Prodi({ content, id_fakultas }: { content: Array<ProdiData>; id_fakultas: number }) {
   const [formData, setFormData] = useState<FormData>({});

   const { onSubmit, isPending } = useUpdatePaguProdi({ id: formData?.id, total_pagu: Number(formData?.total_pagu), setFormData });

   const actionButton = (row: ProdiData) => {
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
      .filter((e) => Number(e.id_fakultas) === id_fakultas)
      .map((row) => (
         <TableRow key={`prodi-${row.id}`}>
            <TableCell className="w-[20px]" />
            <TableCell className="w-[20px]" />
            <TableCell className="w-[20px]" />
            <TableCell className={tableCellClass}>{row.nama}</TableCell>
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
      ));
}
