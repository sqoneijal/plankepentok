import { PaguTableSkeleton } from "@/components/loading-skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { toRupiah } from "@/helpers/init";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { ActionButton, ActionButtonSub, TextTotalPagu } from "./action-button";
import { tableCellClass, type PaguBiroRow, type PaguParentRow, type PaguSubUnitRow } from "./init";

export default function RowPaguBiro({
   isLoading,
   content,
   paguSubUnit,
}: {
   isLoading: boolean;
   content: Array<PaguBiroRow>;
   paguSubUnit?: Array<PaguSubUnitRow>;
}) {
   const [selectedRow, setSelectedRow] = useState<PaguParentRow | PaguSubUnitRow | null>(null);

   return isLoading ? (
      <PaguTableSkeleton />
   ) : (
      content?.map((row) => (
         <React.Fragment key={`biro-${row.id}`}>
            <TableRow>
               <TableCell colSpan={2} className={tableCellClass}>
                  {row?.biro?.nama}
               </TableCell>
               <TableCell className={tableCellClass}>{toRupiah(row?.realisasi)}</TableCell>
               <TableCell className={tableCellClass}>
                  {selectedRow?.id === row?.id ? (
                     <TextTotalPagu value={selectedRow?.total_pagu} onChange={(value) => setSelectedRow({ ...selectedRow, total_pagu: value })} />
                  ) : (
                     toRupiah(row?.total_pagu)
                  )}
               </TableCell>
               <TableCell className={cn(tableCellClass, "text-end")}>
                  <ActionButton row={row} selectedRow={selectedRow} setSelectedRow={setSelectedRow} endpoint="biro" />
               </TableCell>
            </TableRow>
            {row?.biro?.sub_unit?.map((item) => {
               const paguSubUnitRow = paguSubUnit?.find((e) => e.id_sub_unit === item.id);
               if (!paguSubUnitRow) return null;

               return (
                  <TableRow key={item.id}>
                     <TableCell className="w-[40px]" />
                     <TableCell className={tableCellClass}>{item?.nama}</TableCell>
                     <TableCell className={tableCellClass}>{toRupiah(paguSubUnit?.find((e) => e.id_sub_unit === item.id)?.realisasi)}</TableCell>
                     <TableCell className={tableCellClass}>
                        {selectedRow?.id === paguSubUnitRow?.id ? (
                           <TextTotalPagu
                              value={selectedRow?.total_pagu}
                              onChange={(value) => setSelectedRow({ ...selectedRow, total_pagu: value })}
                           />
                        ) : (
                           toRupiah(paguSubUnitRow?.total_pagu)
                        )}
                     </TableCell>
                     <TableCell className={cn(tableCellClass, "text-end")}>
                        <ActionButtonSub row={paguSubUnitRow} selectedRow={selectedRow} setSelectedRow={setSelectedRow} />
                     </TableCell>
                  </TableRow>
               );
            })}
         </React.Fragment>
      ))
   );
}
