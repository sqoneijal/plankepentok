import { TableCell, TableRow } from "@/components/ui/table";
import { toRupiah } from "@/helpers/init";
import type { Lists } from "@/types/init";

export default function Upt({
   tableCellClass,
   paguUPT,
   id_biro,
   actionButton,
   actionText,
   editFormBiro,
}: {
   tableCellClass: string;
   paguUPT: Array<Lists>;
   id_biro: string;
   actionButton: (row: Lists, pagu: string) => React.ReactElement;
   actionText: () => React.ReactElement;
   editFormBiro: string;
}) {
   return paguUPT
      .filter((e) => e.id_biro === id_biro)
      .map((row) => {
         return (
            <TableRow key={`upt-${row.id}`}>
               <TableCell className="w-[20px]" />
               <TableCell className="w-[20px]" />
               <TableCell className={tableCellClass} colSpan={2}>
                  {row.nama}
               </TableCell>
               <TableCell className={tableCellClass}>{toRupiah(row.realisasi)}</TableCell>
               <TableCell className={tableCellClass}>{editFormBiro === `upt_${row.id}` ? actionText() : toRupiah(row.total_pagu)}</TableCell>
               <TableCell className={tableCellClass}>{actionButton(row, "upt")}</TableCell>
            </TableRow>
         );
      });
}
