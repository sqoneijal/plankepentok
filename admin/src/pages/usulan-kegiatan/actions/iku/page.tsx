import { LoadingSkeleton } from "@/components/loading-skeleton";
import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useGetQuery } from "@/hooks/useGetQuery";
import { lazy, Suspense, useState } from "react";
import { getColumns } from "./column";

const ReferensiIku = lazy(() => import("./referensi/page"));

export default function Page({ id_usulan_kegiatan }: Readonly<{ id_usulan_kegiatan?: string }>) {
   const [openSheet, setOpenSheet] = useState(false);

   const { results, total, isLoading } = useGetQuery(`/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`);

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>IKU</CardTitle>
            {["", "draft", "ditolak", "perbaiki"].includes(
               results?.find((e: { usulan_kegiatan: string }) => e.usulan_kegiatan)?.usulan_kegiatan?.status_usulan || ""
            ) && (
               <CardAction>
                  <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                     <SheetTrigger asChild>
                        <Button variant="outline" className="-mt-1">
                           Tambah IKU
                        </Button>
                     </SheetTrigger>
                     <SheetContent className="w-[80%] sm:max-w-none">
                        <SheetHeader className="-mb-8">
                           <SheetTitle>Daftar Referensi IKU</SheetTitle>
                           <SheetDescription>
                              Pilih Indikator Kinerja Utama (IKU) dari daftar referensi yang tersedia untuk kegiatan usulan.
                           </SheetDescription>
                        </SheetHeader>
                        <Suspense fallback={<LoadingSkeleton />}>
                           <div className="p-4">
                              <ReferensiIku setOpenSheet={setOpenSheet} id_usulan_kegiatan={id_usulan_kegiatan} />
                           </div>
                        </Suspense>
                     </SheetContent>
                  </Sheet>
               </CardAction>
            )}
         </CardHeader>
         <CardContent>
            <Table columns={getColumns(id_usulan_kegiatan)} data={results} total={total} isLoading={isLoading} />
         </CardContent>
      </Card>
   );
}
