import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDetailRow } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./column";

const Forms = lazy(() => import("./forms"));

export default function Page({ id_usulan_kegiatan }: Readonly<{ id_usulan_kegiatan?: string }>) {
   const [openSheet, setOpenSheet] = useState(false);

   const { setDetailRow } = useDetailRow();

   const { data, isLoading, error } = useApiQuery({
      url: `/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`,
   });

   if (error) {
      toast.error(`Gagal mengambil data dokumen: ${error?.message}`);
   }

   const results = data?.results ?? [];
   const total = data?.total || 0;

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Dokumen Pendukung</CardTitle>
            {["", "draft", "ditolak", "perbaiki"].includes(
               results?.find((e: { usulan_kegiatan: string }) => e.usulan_kegiatan)?.usulan_kegiatan?.status_usulan || ""
            ) && (
               <CardAction>
                  <Button variant="outline" onClick={() => setOpenSheet(true)} className="-mt-1">
                     Tambah Dokumen Pendukung
                  </Button>
                  <Sheet
                     open={openSheet}
                     onOpenChange={() => {
                        setOpenSheet(false);
                     }}>
                     <SheetContent>
                        <SheetHeader className="-mb-8">
                           <SheetTitle>Dokumen Pendukung</SheetTitle>
                           <SheetDescription>Tambahkan atau perbarui dokumen pendukung untuk kegiatan usulan.</SheetDescription>
                        </SheetHeader>
                        <Suspense>
                           <div className="p-4">
                              <Forms id_usulan_kegiatan={id_usulan_kegiatan} setOpenSheet={setOpenSheet} />
                           </div>
                        </Suspense>
                     </SheetContent>
                  </Sheet>
               </CardAction>
            )}
         </CardHeader>
         <CardContent>
            <Table
               columns={getColumns(setOpenSheet, setDetailRow, id_usulan_kegiatan)}
               data={results}
               total={total}
               isLoading={isLoading}
               usePagination={false}
            />
         </CardContent>
      </Card>
   );
}
