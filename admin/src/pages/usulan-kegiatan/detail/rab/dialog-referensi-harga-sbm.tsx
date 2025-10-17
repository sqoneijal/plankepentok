import { FormSelect, FormText } from "@/components/forms";
import Table from "@/components/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getYearOptions } from "@/helpers/init";
import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import { getColumnsDialog } from "./columns-referensi-harga-sbm";

export default function DialogReferensiHargaSBM({
   open,
   setOpen,
   onRowClick,
}: Readonly<{ open: boolean; setOpen: (open: boolean) => void; onRowClick: (row: Lists) => void }>) {
   const { pagination } = useTablePagination();

   const limit = pagination.pageSize;
   const offset = pagination.pageIndex * pagination.pageSize;

   const [year, setYear] = useState(moment().year().toString());
   const [status_validasi, setStatus_validasi] = useState("");
   const [search, setSearch] = useState("");

   const { data, isLoading, error } = useApiQuery<{
      results: Array<Lists>;
      total: number;
   }>({
      queryKey: ["referensi", "detail-harga-sbm", limit, offset, search, year, status_validasi],
      url: "/referensi/detail-harga-sbm",
      params: { limit, offset, search, year, status_validasi },
   });

   if (error) return toast.error(error?.message);

   return (
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
         <DialogContent className="w-auto min-h-0 sm:max-w-none">
            <DialogHeader>
               <DialogTitle>Daftar Harga SBM</DialogTitle>
               <DialogDescription>
                  Daftar Harga SBM berisi standar biaya yang sudah ditetapkan pemerintah, silakan pilih sesuai kebutuhan dari daftar yang tersedia.
               </DialogDescription>
            </DialogHeader>
            <ScrollArea className="w-full max-h-[calc(100vh-200px)] min-h-0">
               <div className="mb-4 row">
                  <div className="col-12 col-md-4">
                     <FormText label="Cari detail harga SBM..." value={search} onChange={setSearch} name="search" withLabel={false} />
                  </div>
                  <div className="col-12 col-md-2">
                     <FormSelect
                        withLabel={false}
                        label="Tahun"
                        name="year"
                        options={getYearOptions()}
                        value={year.toString()}
                        onValueChange={(value) => setYear(value)}
                        disabled={false}
                     />
                  </div>
                  <div className="col-12 col-md-2">
                     <FormSelect
                        withLabel={false}
                        label="Status"
                        name="status_validasi"
                        options={[
                           { value: "draft", label: "Draft" },
                           { value: "valid", label: "Valid" },
                           { value: "kadaluarsa", label: "Kadaluarsa" },
                        ]}
                        value={status_validasi}
                        onValueChange={(value) => setStatus_validasi(value)}
                        disabled={false}
                     />
                  </div>
               </div>
               <Table
                  columns={getColumnsDialog()}
                  data={Array.isArray(data?.results) ? data?.results : []}
                  total={data?.total ?? 0}
                  isLoading={isLoading}
                  trCursor={true}
                  onRowClick={onRowClick}
               />
            </ScrollArea>
         </DialogContent>
      </Dialog>
   );
}
