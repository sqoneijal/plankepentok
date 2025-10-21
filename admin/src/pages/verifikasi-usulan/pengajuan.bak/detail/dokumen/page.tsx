import { FormSelect } from "@/components/forms";
import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { btn_loading } from "@/helpers/init";
import { useState } from "react";
import { toast } from "sonner";
import { loadingElementSecond } from "../../helpers";
import { getColumns } from "./column";
import { useDokumenData, useUpdateDokumenBatch } from "./init";

export default function Page() {
   const { data, isLoading, error } = useDokumenData();

   const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
   const [selectedStatus, setSelectedStatus] = useState<string>("");

   const updateDokumenBatch = useUpdateDokumenBatch();

   const onSelectRow = (id: string) => {
      setSelectedRows((prev) => {
         const newSet = new Set(prev);
         if (newSet.has(id)) {
            newSet.delete(id);
         } else {
            newSet.add(id);
         }
         return newSet;
      });
   };

   const onSelectAll = () => {
      const allIds = tableData.map((item) => item.id);
      if (selectedRows.size === allIds.length) {
         setSelectedRows(new Set());
      } else {
         setSelectedRows(new Set(allIds));
      }
   };

   if (isLoading) return loadingElementSecond;

   if (error) {
      toast.error(error?.message);
      return null;
   }

   const tableData = Array.isArray(data?.results) ? data?.results : [];

   return (
      <>
         {selectedRows.size > 0 && (
            <div className="row mb-4">
               <div className="col-12 col-md-2">
                  <FormSelect
                     name="approve"
                     label="status"
                     withLabel={false}
                     value={selectedStatus}
                     onValueChange={setSelectedStatus}
                     options={[
                        { value: "sesuai", label: "Sesuai" },
                        { value: "tidak_sesuai", label: "Tidak Sesuai" },
                     ]}
                  />
               </div>
               <div className="col-12 col-md-2">
                  <Button
                     variant="outline"
                     onClick={() => {
                        updateDokumenBatch.mutate(
                           { ids: Array.from(selectedRows), aksi: selectedStatus },
                           {
                              onSuccess: () => {
                                 setSelectedRows(new Set());
                                 setSelectedStatus("");
                              },
                           }
                        );
                     }}
                     size="sm"
                     disabled={updateDokumenBatch.isPending || !selectedStatus}>
                     {updateDokumenBatch.isPending ? btn_loading() : "Simpan"}
                  </Button>
               </div>
            </div>
         )}
         <Table
            columns={getColumns(selectedRows, onSelectRow, onSelectAll, tableData.length)}
            data={tableData}
            total={data?.total ?? 0}
            isLoading={isLoading}
         />
      </>
   );
}
